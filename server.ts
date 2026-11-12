import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, isDbConnected } from './server/db.ts';
import { User } from './server/models/User.ts';
import { HoroscopeRecord } from './server/models/HoroscopeRecord.ts';
import { calculateHoroscope } from './src/services/astrologyEngine.ts';
import { generateLifeReport } from './src/services/predictionEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'vishakha_astra_secure_key_2026';

// In-memory fallback stores when MongoDB_URI is not provided yet
const memoryUsers: Map<string, { id: string; fullName: string; email: string; passwordHash: string }> = new Map();
const memoryHoroscopes: Array<any> = [];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Attempt database connection to MongoDB Atlas Cluster 0
  await connectToDatabase();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Helper Auth Middleware
  const authenticateToken = (req: any, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (!err && user) {
        req.user = user;
      }
      next();
    });
  };

  app.use(authenticateToken);

  // Health endpoint (clean, without leaking secrets or astrology techniques)
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'active',
      name: 'Vishakha_ASTRA',
      database: isDbConnected() ? 'connected (Atlas Cluster 0)' : 'ready (local session active)',
      timestamp: new Date().toISOString(),
    });
  });

  // Global Geocoding Search: Resolves ANY place in India & Worldwide
  app.get('/api/places/search', async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string || '').trim();
      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }

      const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=12&language=en&format=json`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        return res.json({ results: [] });
      }

      const data: any = await response.json();
      const results = (data.results || []).map((item: any) => {
        const tz = item.timezone || (item.country === 'India' ? 'Asia/Kolkata' : 'UTC');
        let offset = 0;
        try {
          const str = new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
          const match = str.match(/GMT([+-]\d+)(?::(\d+))?/);
          if (match) {
            const sign = match[1].startsWith('-') ? -1 : 1;
            const hours = Math.abs(parseInt(match[1], 10));
            const mins = match[2] ? parseInt(match[2], 10) : 0;
            offset = sign * (hours + mins / 60);
          } else if (tz.includes('Kolkata') || item.country === 'India') {
            offset = 5.5;
          }
        } catch {
          offset = (tz.includes('Kolkata') || item.country === 'India') ? 5.5 : 0;
        }

        return {
          id: item.id,
          name: item.name,
          region: item.admin1 || item.admin2 || '',
          country: item.country || '',
          latitude: parseFloat(item.latitude.toFixed(4)),
          longitude: parseFloat(item.longitude.toFixed(4)),
          timezone: tz,
          utcOffset: offset,
          displayName: `${item.name}, ${item.admin1 ? item.admin1 + ', ' : ''}${item.country || ''}`,
        };
      });

      res.json({ results });
    } catch (err: any) {
      console.error('Geocoding search error:', err.message);
      res.json({ results: [] });
    }
  });

  // Helper to determine historical UTC offset for any IANA timezone
  function getTimezoneOffsetHours(tzName: string, dateObj: Date = new Date()): number {
    try {
      const str = dateObj.toLocaleString('en-US', { timeZone: tzName, timeZoneName: 'shortOffset' });
      const match = str.match(/GMT([+-]\d+)(?::(\d+))?/);
      if (!match) return 0;
      const sign = match[1].startsWith('-') ? -1 : 1;
      const hours = Math.abs(parseInt(match[1], 10));
      const mins = match[2] ? parseInt(match[2], 10) : 0;
      return sign * (hours + mins / 60);
    } catch (e) {
      if (tzName && (tzName.includes('Kolkata') || tzName.includes('India'))) return 5.5;
      return 0;
    }
  }

  // Global Places Geocoding Search (Searches every place, town & city worldwide)
  app.get('/api/places/search', async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q || q.trim().length < 2) {
        return res.json({ results: [] });
      }

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=12&language=en&format=json`
      );

      if (!response.ok) {
        return res.json({ results: [] });
      }

      const data: any = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        return res.json({ results: [] });
      }

      const mapped = data.results.map((item: any) => {
        const tz = item.timezone || 'UTC';
        const offset = getTimezoneOffsetHours(tz);
        return {
          id: item.id,
          name: item.name,
          region: item.admin1 || item.admin2 || '',
          country: item.country || '',
          latitude: parseFloat(item.latitude.toFixed(4)),
          longitude: parseFloat(item.longitude.toFixed(4)),
          timezone: tz,
          utcOffset: offset,
        };
      });

      res.json({ results: mapped });
    } catch (err: any) {
      console.error('Geocoding search error:', err.message);
      res.json({ results: [] });
    }
  });

  // User Registration
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { fullName, email, password } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'Please provide full name, email, and password.' });
      }

      const emailNormalized = email.toLowerCase().trim();
      const passwordHash = await bcrypt.hash(password, 10);

      if (isDbConnected()) {
        const existing = await User.findOne({ email: emailNormalized });
        if (existing) {
          return res.status(409).json({ error: 'An account with this email address already exists.' });
        }
        const newUser = await User.create({
          fullName: fullName.trim(),
          email: emailNormalized,
          passwordHash,
        });

        const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email, fullName: newUser.fullName }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
          user: { id: newUser._id.toString(), email: newUser.email, fullName: newUser.fullName },
          token,
        });
      } else {
        if (memoryUsers.has(emailNormalized)) {
          return res.status(409).json({ error: 'An account with this email address already exists.' });
        }
        const id = 'mem_' + Date.now();
        const userObj = { id, fullName: fullName.trim(), email: emailNormalized, passwordHash };
        memoryUsers.set(emailNormalized, userObj);

        const token = jwt.sign({ id, email: emailNormalized, fullName: userObj.fullName }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
          user: { id, email: emailNormalized, fullName: userObj.fullName },
          token,
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed. Please check inputs and try again.' });
    }
  });

  // User Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Please enter both email and password.' });
      }

      const emailNormalized = email.toLowerCase().trim();

      if (isDbConnected()) {
        const user = await User.findOne({ email: emailNormalized });
        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id.toString(), email: user.email, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          user: { id: user._id.toString(), email: user.email, fullName: user.fullName },
          token,
        });
      } else {
        const user = memoryUsers.get(emailNormalized);
        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          user: { id: user.id, email: user.email, fullName: user.fullName },
          token,
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login could not be completed.' });
    }
  });

  // Get current user profile
  app.get('/api/auth/me', (req: any, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ user: null });
    }
    res.json({ user: req.user });
  });

  // Generate Horoscope & Life Analysis
  app.post('/api/horoscope/generate', async (req: any, res: Response) => {
    try {
      const { fullName, gender, birthDate, birthTime, birthPlace, latitude, longitude, utcOffset } = req.body;

      if (!fullName || !birthDate || !birthTime || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Incomplete birth details provided. Please enter date, time, and birthplace.' });
      }

      const parsedLat = parseFloat(latitude);
      const parsedLng = parseFloat(longitude);
      const parsedUtcOffset = utcOffset !== undefined ? parseFloat(utcOffset) : 5.5; // default IST if not given

      // Core calculation engine (Strict 7 Chara Karaka + Lahiri Sidereal, calculation remains internal)
      const calculation = calculateHoroscope(birthDate, birthTime, parsedLat, parsedLng, parsedUtcOffset);

      // Natural language prediction synthesis (ZERO technical jargon)
      const lifeReport = generateLifeReport(fullName, calculation);

      const userId = req.user?.id;
      let savedId = null;

      // Persist in MongoDB Atlas Cluster 0 or local store
      if (isDbConnected()) {
        const record = await HoroscopeRecord.create({
          userId,
          fullName,
          gender: gender || 'unspecified',
          birthDate,
          birthTime,
          birthPlace: birthPlace || 'Unknown',
          latitude: parsedLat,
          longitude: parsedLng,
          utcOffset: parsedUtcOffset,
          reportSummary: lifeReport.personalSummary,
          calculationSnapshot: {
            ascendant: calculation.ascendant,
            planets: calculation.planets,
            charaKarakas: calculation.charaKarakas,
            signs: calculation.signs,
            houses: calculation.houses,
          },
          sections: lifeReport.sections,
        });
        savedId = record._id.toString();
      } else {
        const memRecord = {
          _id: 'rec_' + Date.now(),
          userId,
          fullName,
          gender,
          birthDate,
          birthTime,
          birthPlace,
          latitude: parsedLat,
          longitude: parsedLng,
          utcOffset: parsedUtcOffset,
          reportSummary: lifeReport.personalSummary,
          calculationSnapshot: {
            ascendant: calculation.ascendant,
            planets: calculation.planets,
            charaKarakas: calculation.charaKarakas,
            signs: calculation.signs,
            houses: calculation.houses,
          },
          sections: lifeReport.sections,
          createdAt: new Date(),
        };
        memoryHoroscopes.push(memRecord);
        savedId = memRecord._id;
      }

      res.json({
        id: savedId,
        birthDetails: {
          fullName,
          gender,
          birthDate,
          birthTime,
          birthPlace,
          latitude: parsedLat,
          longitude: parsedLng,
          utcOffset: parsedUtcOffset,
        },
        calculation: {
          ascendant: calculation.ascendant,
          planets: calculation.planets,
          charaKarakas: calculation.charaKarakas,
          signs: calculation.signs,
          houses: calculation.houses,
          ayanamsa: calculation.ayanamsa,
          ayanamsaFormatted: calculation.ayanamsaFormatted,
        },
        report: lifeReport,
      });
    } catch (err: any) {
      console.error('Horoscope calculation error:', err);
      res.status(500).json({ error: 'Failed to generate horoscope report. Please verify birth details.' });
    }
  });

  // Get user's saved horoscopes
  app.get('/api/horoscope/list', async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.json({ horoscopes: [] });
      }

      if (isDbConnected()) {
        const records = await HoroscopeRecord.find({ userId }).sort({ createdAt: -1 }).limit(20);
        return res.json({ horoscopes: records });
      } else {
        const filtered = memoryHoroscopes.filter((h) => h.userId === userId);
        return res.json({ horoscopes: filtered });
      }
    } catch (err: any) {
      console.error('List error:', err);
      res.status(500).json({ error: 'Failed to retrieve saved horoscopes' });
    }
  });

  // Delete a saved horoscope
  app.delete('/api/horoscope/:id', async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        await HoroscopeRecord.findByIdAndDelete(id);
      } else {
        const idx = memoryHoroscopes.findIndex((h) => h._id === id);
        if (idx !== -1) memoryHoroscopes.splice(idx, 1);
      }
      res.json({ success: true, message: 'Horoscope deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Delete operation failed' });
    }
  });

  // Delete account and all user data (Privacy Compliance)
  app.delete('/api/auth/delete-account', async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      const email = req.user?.email;
      if (!userId) return res.status(401).json({ error: 'Not authenticated' });

      if (isDbConnected()) {
        await HoroscopeRecord.deleteMany({ userId });
        await User.findByIdAndDelete(userId);
      } else {
        memoryUsers.delete(email);
        const filtered = memoryHoroscopes.filter((h) => h.userId !== userId);
        memoryHoroscopes.length = 0;
        memoryHoroscopes.push(...filtered);
      }
      res.json({ success: true, message: 'Account and all associated birth records permanently erased.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // Vite Integration
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Vishakha_ASTRA] Running on http://0.0.0.0:${PORT} (Mode: ${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Vishakha_ASTRA] Fatal server error:', err);
  process.exit(1);
});
