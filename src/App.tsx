import React, { useState, useEffect } from 'react';
import {
  Compass,
  User,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Briefcase,
  Coins,
  Home,
  Users,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Milestone,
  CheckCircle2,
  Printer,
  BookmarkPlus,
  RefreshCw,
  LogOut,
  LogIn,
  Search,
  ArrowRight,
  Info,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Sliders,
  X,
} from 'lucide-react';
import { POPULAR_CITIES, CityLocation } from './data/cities.ts';
import { SouthIndianChart } from './components/SouthIndianChart.tsx';
import { NorthIndianChart } from './components/NorthIndianChart.tsx';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

interface HoroscopeReportResponse {
  id?: string;
  birthDetails: {
    fullName: string;
    gender: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    utcOffset: number;
  };
  calculation: any;
  report: {
    personalSummary: {
      fullName: string;
      lifeArchetype: string;
      coreEssence: string;
      keyThemes: string[];
    };
    sections: Array<{
      id: string;
      category: string;
      karakaName?: string;
      karakaAbbr?: string;
      karakaPlanet?: string;
      karakaSign?: string;
      karakaHouse?: number;
      theme: string;
      content: string;
      actionableAdvice: string;
    }>;
    generatedAt: string;
  };
}

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<'create' | 'report' | 'saved' | 'about'>('create');
  const [chartStyle, setChartStyle] = useState<'both' | 'south' | 'north'>('both');

  // Auth States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Form Inputs
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [birthDate, setBirthDate] = useState('1990-09-06'); // Default set to 6/9/1990
  const [birthHour, setBirthHour] = useState('10');
  const [birthMinute, setBirthMinute] = useState('30');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');

  // Location / Geocoding Inputs - Supports every place on Earth
  const [citySearch, setCitySearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(POPULAR_CITIES[0]);
  const [customLocation, setCustomLocation] = useState(false);
  const [customLat, setCustomLat] = useState('28.6139');
  const [customLng, setCustomLng] = useState('77.2090');
  const [customOffset, setCustomOffset] = useState('5.5');
  const [consentGiven, setConsentGiven] = useState(true);

  // Report & Computation States
  const [reportData, setReportData] = useState<HoroscopeReportResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Informational Modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Check stored JWT token on load
  useEffect(() => {
    const token = localStorage.getItem('vishakha_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setUser(data.user);
        })
        .catch(() => localStorage.removeItem('vishakha_auth_token'));
    }
  }, []);

  // Live global place geocoding search for ANY city/town worldwide
  useEffect(() => {
    if (!citySearch || citySearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingPlaces(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(citySearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const liveResults = data.results || [];

          // Also match built-in popular cities
          const offlineMatches = POPULAR_CITIES.filter((c) =>
            `${c.name} ${c.region} ${c.country}`.toLowerCase().includes(citySearch.toLowerCase())
          ).map((c, i) => ({
            id: `off_${i}`,
            name: c.name,
            region: c.region,
            country: c.country,
            latitude: c.latitude,
            longitude: c.longitude,
            utcOffset: c.utcOffset,
            displayName: `${c.name}, ${c.region ? c.region + ', ' : ''}${c.country}`,
          }));

          const combined = [...liveResults];
          offlineMatches.forEach((off) => {
            if (!combined.some((item) => item.name.toLowerCase() === off.name.toLowerCase() && item.country.toLowerCase() === off.country.toLowerCase())) {
              combined.push(off);
            }
          });

          setSearchResults(combined);
        }
      } catch (err) {
        console.error('Failed to search places:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [citySearch]);

  // Fetch saved horoscopes if logged in
  const loadSavedProfiles = async () => {
    const token = localStorage.getItem('vishakha_auth_token');
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/horoscope/list', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSavedRecords(data.horoscopes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (currentView === 'saved') {
      loadSavedProfiles();
    }
  }, [currentView, user]);

  // Live Global Place Search (Searches any town, city, or village on Earth)
  useEffect(() => {
    if (!citySearch || citySearch.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingPlaces(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(citySearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setSearchResults(data.results);
          } else {
            // Fallback to local filtering
            setSearchResults(filteredCities);
          }
        }
      } catch (err) {
        console.error('Failed to search places:', err);
        setSearchResults(filteredCities);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [citySearch]);

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload =
      authMode === 'login'
        ? { email: authEmail, password: authPassword }
        : { fullName: authName, email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('vishakha_auth_token', data.token);
      setUser(data.user);
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Operation could not be completed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vishakha_auth_token');
    setUser(null);
  };

  // Convert 12-hour format to 24-hour string HH:MM
  const get24HourTimeString = () => {
    let h = parseInt(birthHour, 10);
    if (birthAmPm === 'PM' && h < 12) h += 12;
    if (birthAmPm === 'AM' && h === 12) h = 0;
    const hStr = h.toString().padStart(2, '0');
    const mStr = birthMinute.padStart(2, '0');
    return `${hStr}:${mStr}`;
  };

  // Generate Report Handler
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Please enter the full name for the birth analysis.');
      return;
    }
    if (!consentGiven) {
      setFormError('Please check the consent box to proceed with analysis.');
      return;
    }

    setFormError(null);
    setIsGenerating(true);

    const lat = customLocation ? parseFloat(customLat) : selectedCity.latitude;
    const lng = customLocation ? parseFloat(customLng) : selectedCity.longitude;
    const offset = customLocation ? parseFloat(customOffset) : selectedCity.utcOffset;
    const place = customLocation ? 'Custom Coordinates' : `${selectedCity.name}, ${selectedCity.country}`;
    const time24 = get24HourTimeString();

    const token = localStorage.getItem('vishakha_auth_token');

    try {
      const res = await fetch('/api/horoscope/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          gender,
          birthDate,
          birthTime: time24,
          birthPlace: place,
          latitude: lat,
          longitude: lng,
          utcOffset: offset,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate horoscope report.');
      }

      setReportData(data);
      setCurrentView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err.message || 'Calculation error. Please check values.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered Cities for Auto-Complete
  const filteredCities = POPULAR_CITIES.filter((c) =>
    `${c.name} ${c.country} ${c.region}`.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Icon mapping helper for categories
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'personality':
        return <User className="w-5 h-5 text-amber-700" />;
      case 'strengths':
        return <Sparkles className="w-5 h-5 text-amber-700" />;
      case 'growth-areas':
        return <TrendingUp className="w-5 h-5 text-amber-700" />;
      case 'career':
        return <Briefcase className="w-5 h-5 text-amber-700" />;
      case 'finances':
        return <Coins className="w-5 h-5 text-amber-700" />;
      case 'relationships':
        return <Heart className="w-5 h-5 text-amber-700" />;
      case 'family':
        return <Home className="w-5 h-5 text-amber-700" />;
      case 'social':
        return <Users className="w-5 h-5 text-amber-700" />;
      case 'creativity':
        return <Compass className="w-5 h-5 text-amber-700" />;
      case 'challenges':
        return <ShieldAlert className="w-5 h-5 text-amber-700" />;
      case 'spirituality':
        return <ShieldCheck className="w-5 h-5 text-amber-700" />;
      case 'life-direction':
        return <Milestone className="w-5 h-5 text-amber-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-pure-white text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Compass className="w-6 h-6 transform group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <span className="brand-title text-xl font-bold tracking-tight text-slate-950 block">
                Vishakha_ASTRA
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                Personalized Life Insights & Horoscope
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm">
            <button
              onClick={() => setCurrentView('create')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'create'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              New Analysis
            </button>

            {reportData && (
              <button
                onClick={() => setCurrentView('report')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'report'
                    ? 'bg-slate-100 text-slate-950 font-semibold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                Current Report
              </button>
            )}

            <button
              onClick={() => setCurrentView('saved')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'saved'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Saved Profiles
            </button>

            <button
              onClick={() => setCurrentView('about')}
              className={`hidden md:inline-flex px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'about'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              About
            </button>

            {/* User Account / Login Button */}
            <div className="ml-2 pl-2 border-l border-slate-200">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium text-slate-700 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: BIRTH DETAILS FORM */}
        {currentView === 'create' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Introduction Banner */}
            <div className="text-center space-y-3 pt-4">
              <span className="badge-gold px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
                Personalized Life Horoscope & Destiny Analysis
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight brand-title">
                Enter Your Exact Birth Details
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Accurate birth time and birthplace coordinates allow Vishakha_ASTRA to map your rising configuration and synthesize deep, personalized life guidance across all key domains.
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to proceed</p>
                  <p className="text-xs text-rose-700 mt-0.5">{formError}</p>
                </div>
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleGenerateReport} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Full Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Eleanor Vance or Aryan Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other / Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Pick:</span>
                  <button
                    type="button"
                    onClick={() => setBirthDate('1990-09-06')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      birthDate === '1990-09-06'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Default: 6/9/1990 (Sep 6, 1990)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBirthDate('1990-06-09')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      birthDate === '1990-06-09'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Jun 9, 1990
                  </button>
                </div>
              </div>

              {/* Exact Time of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Exact Time of Birth <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Hour (1-12)</label>
                    <select
                      value={birthHour}
                      onChange={(e) => setBirthHour(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-slate-800"
                    >
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((h) => (
                        <option key={h} value={h}>
                          {h.padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Minute (00-59)</label>
                    <select
                      value={birthMinute}
                      onChange={(e) => setBirthMinute(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-slate-800"
                    >
                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Period</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setBirthAmPm('AM')}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          birthAmPm === 'AM'
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setBirthAmPm('PM')}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          birthAmPm === 'PM'
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Exact birth time ensures an accurate Ascendant rising sign calculation.</span>
                </p>
              </div>

              {/* Place of Birth Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Place of Birth <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomLocation(!customLocation)}
                    className="text-xs text-amber-800 hover:underline flex items-center space-x-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{customLocation ? 'Select from City List' : 'Enter Custom Coordinates'}</span>
                  </button>
                </div>

                {!customLocation ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search any place, city, town, or district in India & worldwide..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-sm"
                      />
                      <div className="absolute right-3.5 top-3 flex items-center space-x-1.5">
                        {isSearchingPlaces && <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />}
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {citySearch && citySearch.trim().length >= 2 && (
                      <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg divide-y divide-slate-100 z-20 relative">
                        {isSearchingPlaces && searchResults.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-500 flex items-center space-x-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                            <span>Locating places across global database...</span>
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((place) => (
                            <button
                              key={`${place.id || place.name}-${place.latitude}-${place.longitude}`}
                              type="button"
                              onClick={() => {
                                setSelectedCity({
                                  name: place.name,
                                  region: place.region || '',
                                  country: place.country || '',
                                  latitude: place.latitude,
                                  longitude: place.longitude,
                                  utcOffset: place.utcOffset !== undefined ? place.utcOffset : 5.5,
                                });
                                setCitySearch('');
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-slate-900">{place.name}</span>
                                <span className="text-slate-500 ml-1">
                                  {place.region ? `${place.region}, ` : ''}{place.country}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] text-slate-500 font-mono block">
                                  {place.latitude?.toFixed(2)}°, {place.longitude?.toFixed(2)}°
                                </span>
                                <span className="text-[10px] text-amber-800 font-mono">
                                  UTC {place.utcOffset >= 0 ? `+${place.utcOffset}` : place.utcOffset}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-500">
                            No locations found matching &quot;{citySearch}&quot;. You can enter custom coordinates using the toggle above.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Popular City Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 self-center mr-1">Quick Select:</span>
                      {[
                        { name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, offset: 5.5 },
                        { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, offset: 5.5 },
                        { name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, offset: 5.5 },
                        { name: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867, offset: 5.5 },
                        { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, offset: 5.5 },
                        { name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, offset: 5.5 },
                        { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, offset: 0.0 },
                        { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, offset: -5.0 },
                        { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, offset: 4.0 },
                      ].map((chip) => (
                        <button
                          key={chip.name}
                          type="button"
                          onClick={() => {
                            setSelectedCity({
                              name: chip.name,
                              region: '',
                              country: chip.country,
                              latitude: chip.lat,
                              longitude: chip.lng,
                              utcOffset: chip.offset,
                            });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                            selectedCity.name === chip.name
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {chip.name}
                        </button>
                      ))}
                    </div>

                    {/* Active Selected Location Display */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mt-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-amber-700" />
                        <div>
                          <span className="font-semibold text-slate-900">{selectedCity.name}</span>
                          <span className="text-slate-500 ml-1">
                            {selectedCity.region ? `${selectedCity.region}, ` : ''}{selectedCity.country}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {selectedCity.latitude.toFixed(2)}°N, {selectedCity.longitude.toFixed(2)}°E • UTC {selectedCity.utcOffset >= 0 ? `+${selectedCity.utcOffset}` : selectedCity.utcOffset}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Latitude (Decimal)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={customLat}
                        onChange={(e) => setCustomLat(e.target.value)}
                        placeholder="e.g. 28.6139"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Longitude (Decimal)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={customLng}
                        onChange={(e) => setCustomLng(e.target.value)}
                        placeholder="e.g. 77.2090"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        UTC Offset (Hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={customOffset}
                        onChange={(e) => setCustomOffset(e.target.value)}
                        placeholder="e.g. 5.5 for IST"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Consent and Privacy Agreement */}
              <div className="pt-2">
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to have my birth details processed to calculate my personalized horoscope and life report.
                    I acknowledge that astrological insights are traditional, belief-based frameworks intended for personal reflection and guidance.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Synthesizing Personalized Life Report...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Full Life Horoscope Report</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 2: HOROSCOPE & LIFE GUIDANCE REPORT */}
        {currentView === 'report' && reportData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <button
                onClick={() => setCurrentView('create')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center space-x-1"
              >
                <span>← New Analysis</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>

                {user && (
                  <button
                    onClick={() => {
                      setSaveSuccessMessage('Horoscope profile safely preserved in your account.');
                      setTimeout(() => setSaveSuccessMessage(null), 3000);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-xs font-medium text-amber-900 hover:bg-amber-100 flex items-center space-x-1.5 shadow-xs"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Saved in Database</span>
                  </button>
                )}
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* Person Banner & Life Archetype Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                    <span>Personalized Horoscope Analysis</span>
                    <span>•</span>
                    <span>{reportData.birthDetails.birthPlace}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 brand-title">
                    {reportData.report.personalSummary.fullName}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Born on {reportData.birthDetails.birthDate} at {reportData.birthDetails.birthTime}
                  </p>
                </div>

                {/* Archetype Box */}
                <div className="lg:text-right">
                  <span className="badge-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-1">
                    Core Life Archetype
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 brand-title">
                    {reportData.report.personalSummary.lifeArchetype}
                  </div>
                </div>
              </div>

              {/* Essence & Key Themes */}
              <div className="pt-6 space-y-4">
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  {reportData.report.personalSummary.coreEssence}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {reportData.report.personalSummary.keyThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Traditional Horoscope Charts Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 brand-title">
                    Horoscope Birth Charts
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Classical South Indian and North Indian charts calculated from your exact birth coordinates.
                  </p>
                </div>

                {/* Chart Toggle */}
                <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
                  <button
                    onClick={() => setChartStyle('both')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      chartStyle === 'both' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Side by Side
                  </button>
                  <button
                    onClick={() => setChartStyle('south')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      chartStyle === 'south' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    South Indian
                  </button>
                  <button
                    onClick={() => setChartStyle('north')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      chartStyle === 'north' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    North Indian
                  </button>
                </div>
              </div>

              {/* Chart Visualizations Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(chartStyle === 'both' || chartStyle === 'south') && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700 text-center uppercase tracking-wider">
                      South Indian Style Chart
                    </div>
                    <SouthIndianChart calculation={reportData.calculation} />
                  </div>
                )}

                {(chartStyle === 'both' || chartStyle === 'north') && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700 text-center uppercase tracking-wider">
                      North Indian Style Chart
                    </div>
                    <NorthIndianChart calculation={reportData.calculation} />
                  </div>
                )}
              </div>
            </div>

            {/* Exact Planetary Positions Table (NASA JPL DE405 Precision) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base brand-title">
                    Exact Planetary Longitudes & House Placements
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated using standard Lahiri (Chitrapaksha) Sidereal Zodiac.
                  </p>
                </div>
                {reportData.calculation?.ayanamsaFormatted && (
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Lahiri Ayanamsa: {reportData.calculation.ayanamsaFormatted}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Celestial Body</th>
                      <th className="py-2.5 px-3">Rasi (Sign)</th>
                      <th className="py-2.5 px-3">Exact Degree</th>
                      <th className="py-2.5 px-3">House</th>
                      <th className="py-2.5 px-3">Nakshatra</th>
                      <th className="py-2.5 px-3">Pada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Ascendant Row */}
                    {reportData.calculation?.ascendant && (
                      <tr className="bg-amber-50/30 font-semibold text-slate-900">
                        <td className="py-2.5 px-3 text-amber-900">
                          Ascendant (Lagna)
                        </td>
                        <td className="py-2.5 px-3">{reportData.calculation.ascendant.signName}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-900">
                          {reportData.calculation.ascendant.degreeFormatted}
                        </td>
                        <td className="py-2.5 px-3">House 1</td>
                        <td className="py-2.5 px-3">{reportData.calculation.ascendant.nakshatra}</td>
                        <td className="py-2.5 px-3">{reportData.calculation.ascendant.pada}</td>
                      </tr>
                    )}
                    {/* Planets Rows */}
                    {(reportData.calculation?.planets || []).map((p: any) => (
                      <tr key={p.name} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center space-x-1.5">
                          <span className="w-5 text-center text-slate-500 font-mono text-[11px]">{p.symbol}</span>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{p.signName}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-950">
                          {p.degreeFormatted || `${p.degreeInSign.toFixed(2)}°`}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">House {p.house}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.nakshatra}</td>
                        <td className="py-2.5 px-3 text-slate-600">Pada {p.pada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Chara Karakas Table & Significator Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="badge-gold px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                      Seven-Karaka Jaimini System
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">Rahu & Ketu Excluded</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 brand-title mt-1">
                    Your Individual Chara Karakas
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Planets ranked in strictly descending order of their longitudinal degrees within their respective zodiac signs.
                  </p>
                </div>
              </div>

              {/* Responsive Karaka Grid / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {(reportData.calculation?.charaKarakas || []).map((karaka: any, idx: number) => {
                  const isAK = karaka.abbreviation === 'AK';
                  const isAmK = karaka.abbreviation === 'AmK';
                  const isDK = karaka.abbreviation === 'DK';

                  return (
                    <div
                      key={karaka.karakaRole}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isAK
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : isAmK
                          ? 'bg-sky-50/30 border-sky-200'
                          : isDK
                          ? 'bg-rose-50/30 border-rose-200'
                          : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Role Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                              isAK
                                ? 'bg-amber-200 text-amber-900'
                                : isAmK
                                ? 'bg-sky-200 text-sky-900'
                                : isDK
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {karaka.abbreviation}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-slate-900 truncate" title={karaka.karakaRole}>
                          {karaka.karakaRole}
                        </div>

                        {/* Planet Name & Symbol */}
                        <div className="mt-2 flex items-baseline space-x-1">
                          <span className="text-base font-extrabold text-slate-950 font-serif-vedic">
                            {karaka.planetName}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">({karaka.symbol})</span>
                        </div>

                        {/* Degree in Sign */}
                        <div className="mt-1 font-mono text-[11px] font-semibold text-slate-700">
                          {karaka.degreeFormatted || `${karaka.degreeInSign?.toFixed(2)}°`}
                        </div>

                        {/* Sign & House */}
                        <div className="mt-1 text-[11px] text-slate-600">
                          <span className="font-medium text-slate-800">{karaka.signName}</span>
                          <span className="text-slate-400 text-[10px] block">House {karaka.house}</span>
                        </div>
                      </div>

                      {/* Significator Footer */}
                      <div className="mt-3 pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                          {karaka.significator}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanatory Jaimini Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Atmakaraka (AK):</strong> Soul&apos;s journey • <strong>Amatyakaraka (AmK):</strong> Career & intellect • <strong>Darakaraka (DK):</strong> Spouse & marriage
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Ranked by degree from 30° down to 0°
                </span>
              </div>
            </div>

            {/* In-Depth Life Interpretations Based on Individual Karakas */}
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <div className="badge-gold px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider inline-block mb-1">
                  Rooted in Your Chara Karakas
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 brand-title">
                  Detailed Life Interpretations
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Each life domain below is directly derived from your governing Karaka planet, sign placement, and classical Jaimini principles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportData.report.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="card-white rounded-2xl p-6 flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Section Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                            {getCategoryIcon(sec.id)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base brand-title">
                              {sec.category}
                            </h3>
                            <span className="text-[11px] font-medium text-amber-800">
                              {sec.theme}
                            </span>
                          </div>
                        </div>

                        {/* Governing Karaka Tag */}
                        {sec.karakaAbbr && (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                            {sec.karakaAbbr}
                          </span>
                        )}
                      </div>

                      {/* Karaka Source Indicator */}
                      <div className="mb-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Governing Significator:</span>
                        <span className="font-semibold text-slate-900">
                          {sec.karakaName} — {sec.karakaPlanet} in {sec.karakaSign}
                        </span>
                      </div>

                      {/* Natural Interpretation Content */}
                      <p className="text-sm text-slate-700 leading-relaxed mt-2">
                        {sec.content}
                      </p>
                    </div>

                    {/* Actionable Reflection / Practical Advice */}
                    <div className="mt-5 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                      <div className="flex items-start space-x-2">
                        <Compass className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                            Key Reflection & Remedy
                          </span>
                          <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                            {sec.actionableAdvice}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center max-w-2xl mx-auto">
              Vishakha_ASTRA provides traditional personal guidance. Interpretations are intended to illuminate personal strengths, relationship harmony, and life possibilities.
            </div>
          </div>
        )}

        {/* VIEW 3: SAVED PROFILES */}
        {currentView === 'saved' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 brand-title">
                  Saved Horoscope Profiles
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Access stored birth charts and life reports stored in your database.
                </p>
              </div>

              <button
                onClick={loadSavedProfiles}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs flex items-center space-x-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSaved ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingSaved ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                Loading records from database...
              </div>
            ) : savedRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <BookmarkPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">No Saved Profiles Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Generate a new horoscope analysis and save it to your account to review anytime.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('create')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Create First Horoscope
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedRecords.map((item) => (
                  <div
                    key={item._id}
                    className="card-white rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.birthPlace}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base brand-title">
                        {item.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Born {item.birthDate} at {item.birthTime}
                      </p>
                      {item.reportSummary?.lifeArchetype && (
                        <div className="mt-3 badge-gold px-2.5 py-1 rounded-md text-[11px] font-semibold inline-block">
                          {item.reportSummary.lifeArchetype}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setReportData({
                            id: item._id,
                            birthDetails: {
                              fullName: item.fullName,
                              gender: item.gender || 'unspecified',
                              birthDate: item.birthDate,
                              birthTime: item.birthTime,
                              birthPlace: item.birthPlace,
                              latitude: item.latitude,
                              longitude: item.longitude,
                              utcOffset: item.utcOffset,
                            },
                            calculation: item.calculationSnapshot,
                            report: {
                              personalSummary: item.reportSummary,
                              sections: item.sections,
                              generatedAt: item.createdAt,
                            },
                          });
                          setCurrentView('report');
                        }}
                        className="text-xs font-semibold text-slate-900 hover:text-amber-800 flex items-center space-x-1"
                      >
                        <span>View Full Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm('Delete this saved profile?')) {
                            await fetch(`/api/horoscope/${item._id}`, { method: 'DELETE' });
                            loadSavedProfiles();
                          }
                        }}
                        title="Delete Profile"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: ABOUT & PHILOSOPHY */}
        {currentView === 'about' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2 pt-2">
              <span className="badge-gold px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
                Philosophy & Guidance
              </span>
              <h1 className="text-3xl font-extrabold text-slate-950 brand-title">
                About Vishakha_ASTRA
              </h1>
              <p className="text-slate-600 text-sm max-w-xl mx-auto">
                Human-centered personalized life insights rooted in timeless wisdom.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs leading-relaxed text-sm text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900 text-base brand-title mb-2">
                  Our Guiding Principle
                </h3>
                <p>
                  Vishakha_ASTRA was created to deliver deep, meaningful life insights without burying users under complex technical terminology. By synthesizing the unique celestial alignments at your exact moment and location of birth, the platform provides clear, actionable perspectives on your inner essence, relationships, vocation, and spiritual evolution.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base brand-title mb-2">
                  Personalized Wisdom, Not Generic Horoscopes
                </h3>
                <p>
                  Every individual’s life trajectory is unique. Rather than relying on simple sun-sign generalizations, Vishakha_ASTRA examines the interplay of your core rising orientation, mental instincts, partnership ideals, and personal obstacles, mapping them into 12 detailed domains of living.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base brand-title mb-2">
                  Privacy and Integrity
                </h3>
                <p>
                  Your birth information is personal. We do not sell your personal data or share your horoscope profiles with third parties. All accounts have full rights to inspect, preserve, or permanently delete stored records at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal (Login / Register) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 brand-title">
                {authMode === 'login' ? 'Sign in to Vishakha_ASTRA' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'login'
                  ? 'Access your saved birth profiles and life reports.'
                  : 'Preserve your horoscopes securely in the database.'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : authMode === 'login' ? (
                  <span>Sign In</span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 brand-title mb-3">
              Privacy & Belief-Based Disclaimer
            </h3>

            <div className="text-xs text-slate-600 space-y-3 max-h-96 overflow-y-auto pr-2 leading-relaxed">
              <p>
                <strong>Confidentiality:</strong> Your birth date, time, and coordinates are used solely to compute your personal astrological chart. We do not sell or monetize personal data.
              </p>
              <p>
                <strong>Belief-Based Guidance:</strong> Vedic astrology interpretations provided by Vishakha_ASTRA are based on traditional classical frameworks. They are intended for self-reflection and personal insight, and should not be construed as medical, legal, or definitive financial advice.
              </p>
              <p>
                <strong>Right to Erasure:</strong> You can delete any saved horoscope profile or your entire account data anytime directly from your dashboard.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pure White Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="brand-title font-bold text-slate-900">Vishakha_ASTRA</span>
            <span>•</span>
            <span>Personalized Life Insights</span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-slate-800 underline"
            >
              Privacy & Terms
            </button>
            <span>•</span>
            <span>Pure White Presentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
