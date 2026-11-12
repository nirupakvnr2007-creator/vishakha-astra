/**
 * Vishakha_ASTRA - Karaka-Based Jaimini Life Prediction Engine
 * 
 * Generates in-depth, authentic predictions rooted directly in the individual's
 * 7 Chara Karakas:
 * 1. Atmakaraka (AK) - Soul Purpose, Core Temperament, Dignity
 * 2. Amatyakaraka (AmK) - Career, Mind, Professional Execution
 * 3. Bhratrikaraka (BK) - Courage, Siblings, Mentors & Comrades
 * 4. Matrikaraka (MK) - Mother, Home, Vehicles, Emotional Foundation
 * 5. Putrakaraka (PK) - Creativity, Progeny, Intellect & Scholarship
 * 6. Gnatikaraka (GK) - Tests, Competitors, Obstacles & Growth Through Adversity
 * 7. Darakaraka (DK) - Spouse, Marriage, Intimacy & Long-Term Partnerships
 */

import type { HoroscopeCalculationResult, CharaKarakaAssignment } from './astrologyEngine.ts';

export interface InterpretationCategory {
  id: string;
  category: string;
  karakaName: string;
  karakaAbbr: string;
  karakaPlanet: string;
  karakaSign: string;
  karakaHouse: number;
  theme: string;
  content: string;
  actionableAdvice: string;
}

export interface FullLifeReport {
  personalSummary: {
    fullName: string;
    lifeArchetype: string;
    coreEssence: string;
    keyThemes: string[];
    akPlanet: string;
    amkPlanet: string;
    dkPlanet: string;
  };
  charaKarakasList: CharaKarakaAssignment[];
  sections: InterpretationCategory[];
  generatedAt: string;
}

export function generateLifeReport(
  fullName: string,
  calculation: HoroscopeCalculationResult
): FullLifeReport {
  const getKaraka = (roleName: string) => {
    return calculation.charaKarakas.find((k) => k.karakaRole === roleName) || calculation.charaKarakas[0];
  };

  const ak = getKaraka('Atmakaraka');
  const amk = getKaraka('Amatyakaraka');
  const bk = getKaraka('Bhratrikaraka');
  const mk = getKaraka('Matrikaraka');
  const pk = getKaraka('Putrakaraka');
  const gk = getKaraka('Gnatikaraka');
  const dk = getKaraka('Darakaraka');

  // Interpretations tailored to the specific planet holding each Karaka role
  // 1. ATMAKARAKA (AK) - Personality & Soul Purpose
  const getAkPersonalityAnalysis = (k: CharaKarakaAssignment) => {
    switch (k.planetName) {
      case 'Sun':
        return `As your Atmakaraka (Soul Significator), the Sun in ${k.signName} (House ${k.house}, ${k.degreeFormatted}) bestows an innate aura of nobility, ethical rectitude, and executive gravity. Your soul's primary incarnation lesson revolves around mastering the ego—learning to lead through benevolent stewardship rather than personal pride. You possess natural dignity and seek to live in total alignment with truth. In ${k.signName}, your inner self shines through unwavering principles and self-reliance.`;
      case 'Moon':
        return `With the Moon as your Atmakaraka in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), your soul's deepest calling is emotional purification, boundless empathy, and universal compassion. Your inner nature is fluid, receptive, and profoundly sensitive to the emotional atmospheres around you. Your life journey demands that you cultivate inner emotional equilibrium—learning that true stability comes from self-grounding rather than external validation. In ${k.signName}, you are an intuitive sanctuary for others.`;
      case 'Mars':
        return `Holding the supreme rank of Atmakaraka in your chart, Mars in ${k.signName} (House ${k.house}, ${k.degreeFormatted}) defines your core soul purpose as righteous courage and the constructive discipline of passion. In classical Jaimini lore, a Mars Atmakaraka indicates a soul that has arrived to champion justice and conquer physical or mental lethargy. Your test is to channel intense primal drive into strategic, patient action without giving in to anger or haste.`;
      case 'Mercury':
        return `As your Atmakaraka, Mercury in ${k.signName} (House ${k.house}, ${k.degreeFormatted}) indicates a soul whose supreme mission is the pursuit of truth through speech, learning, and discrimination. You have a lively, agile intellect that seeks to analyze and harmonize diverse viewpoints. Your core spiritual growth comes from learning to master speech—ensuring your words are truthful, kind, and purposeful rather than scattered or overly critical.`;
      case 'Jupiter':
        return `With Jupiter as your Atmakaraka in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), your soul carries the archetype of the spiritual preceptor, counselor, and guardian of dharma. You have an organic reverence for wisdom, justice, and the upliftment of society. In Jaimini principles, a Jupiter AK demands that you respect all living beings equally and guard against moral superiority. Your life expands through generous teaching and mentorship.`;
      case 'Venus':
        return `Venus holding the rank of Atmakaraka in ${k.signName} (House ${k.house}, ${k.degreeFormatted}) indicates that your soul's deepest evolutionary journey centers on pure devotion, aesthetic harmony, and sacred relationships. You naturally perceive the sacred in beauty and human intimacy. Your core life lesson is cultivating emotional restraint and unconditional love—learning that true love is an act of spiritual self-giving rather than possessiveness.`;
      case 'Saturn':
        return `As your Atmakaraka in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), Saturn bestows an ancient, contemplative soul with deep stamina, stoic endurance, and quiet resilience. You understand life through the crucible of patience and service. Jaimini texts emphasize that a Saturn AK brings early responsibilities to forge unshakeable character. You are here to build lasting foundations and share the wisdom of perseverance.`;
      default:
        return `Your Atmakaraka in ${k.signName} guides your soul toward purposeful evolution, inner dignity, and moral alignment.`;
    }
  };

  // 2. AMATYAKARAKA (AmK) - Career & Professional Direction
  const getAmkCareerAnalysis = (k: CharaKarakaAssignment, akK: CharaKarakaAssignment) => {
    const planetRoles: { [p: string]: string } = {
      Sun: `Your Amatyakaraka (Career & Mind Significator) is the Sun in ${k.signName} (House ${k.house}). You are built for leadership, strategic policy, administrative oversight, and sovereign roles where your vision directs the collective effort. You excel when given autonomy and decision-making power. Working in synergy with your Atmakaraka (${akK.planetName}), your professional reputation will be cemented through ethical authority and high personal integrity.`,
      Moon: `With the Moon as your Amatyakaraka in ${k.signName} (House ${k.house}), your professional intellect thrives in fields requiring deep human connection, creative expression, counseling, public relations, healthcare, or hospitality. You possess an instinct for public needs and market sentiment. Your career flourishes when you infuse your daily work with care, restorative empathy, and responsive intuition.`,
      Mars: `Your Amatyakaraka is Mars in ${k.signName} (House ${k.house}), signaling a formidable professional drive suited for technology, engineering, entrepreneurship, legal dispute resolution, surgical precision, or high-stakes project execution. You thrive under pressure and prefer dynamic, competitive arenas where obstacles are converted into strategic milestones.`,
      Mercury: `With Mercury holding the post of Amatyakaraka in ${k.signName} (House ${k.house}), your professional execution is marked by commercial agility, analytical brilliance, communications, writing, commerce, and advisory consultancy. You bridge diverse groups effortlessly and possess a talent for synthesizing data into clear strategic narratives.`,
      Jupiter: `Your Amatyakaraka is Jupiter in ${k.signName} (House ${k.house}), making you a natural counselor, educator, financial strategist, judiciary figure, or institutional mentor. You command respect because your professional recommendations are rooted in long-term foresight, ethics, and prudence. People look to you to navigate complex moral and structural decisions.`,
      Venus: `With Venus acting as your Amatyakaraka in ${k.signName} (House ${k.house}), your professional gifts center on design, diplomacy, value creation, media, client experience, architecture, luxury arts, and high-level mediation. You succeed by introducing harmony, visual refinement, and collaborative ease into organizational structures.`,
      Saturn: `Your Amatyakaraka is Saturn in ${k.signName} (House ${k.house}), indicating a career trajectory characterized by methodical ascent, operational excellence, systems architecture, and deep domain mastery. You may experience slow, deliberate beginnings, but your unyielding discipline ultimately yields immense professional authority and an unshakeable institutional legacy.`,
    };
    return planetRoles[k.planetName] || planetRoles['Jupiter'];
  };

  // 3. DARAKARAKA (DK) - Marriage & Life Partner
  const getDkMarriageAnalysis = (k: CharaKarakaAssignment) => {
    const partnerTraits: { [p: string]: string } = {
      Sun: `In the Jaimini system, your Darakaraka (Spouse & Relationship Significator) is the Sun in ${k.signName} (House ${k.house}, ${k.degreeFormatted}). Your life partner will carry an aura of dignity, self-respect, and prominent leadership. They are likely to be honorable, morally driven, and dedicated to their public standing. In marriage, mutual respect and giving each other space for individual sovereignty will create an enduring, proud union.`,
      Moon: `Your Darakaraka is the Moon in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), indicating that your spouse will possess a gentle, deeply nurturing, and emotionally perceptive temperament. They bring emotional sanctuary, domestic warmth, and intuitive understanding into your life. Relationship harmony flourishes through openhearted vulnerability, affection, and peaceful home life.`,
      Mars: `With Mars as your Darakaraka in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), your life partner will be spirited, physically active, decisive, and ambitious. They possess strong protective instincts and prefer direct, transparent communication. The union is lively and passionate; channel mutual energy toward shared fitness and adventurous projects to prevent needless friction.`,
      Mercury: `Your Darakaraka is Mercury in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), meaning your life partner is witty, intellectually curious, adaptable, and a conversational delight. They keep your relationship fresh through shared humor, travel, and constant learning. Friendship and mental camaraderie form the bedrock of your marital happiness.`,
      Jupiter: `Holding the sacred post of Darakaraka, Jupiter in ${k.signName} (House ${k.house}, ${k.degreeFormatted}) indicates a partner of high philosophical wisdom, moral character, and generous disposition. They may have a background in teaching, law, spirituality, or leadership. Their presence brings blessings, prosperity, and emotional security into your household.`,
      Venus: `Your Darakaraka is Venus in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), pointing to a life partner of graceful refinement, artistic charm, and exceptional beauty. They possess a loving heart, diplomatic tact, and an eye for harmony. Your marriage is characterized by romance, shared aesthetic pleasures, and mutual devotion.`,
      Saturn: `With Saturn as your Darakaraka in ${k.signName} (House ${k.house}, ${k.degreeFormatted}), your spouse is deeply dependable, mature, realistic, and faithful. They may be older in temperament or age, bringing grounded sobriety and emotional stability into your life. While they may express affection through steady duty rather than effusive words, their loyalty is unshakeable through life's storms.`,
    };
    return partnerTraits[k.planetName] || partnerTraits['Venus'];
  };

  // 4. GNATIKARAKA (GK) - Challenges & Life Obstacles
  const getGkChallengesAnalysis = (k: CharaKarakaAssignment) => {
    const challengeTypes: { [p: string]: string } = {
      Sun: `Your Gnatikaraka is the Sun in ${k.signName} (House ${k.house}). Your life tests center around power struggles, clashes with authority figures, and overcoming personal pride. Learning to handle bureaucratic resistance and recognizing that true authority requires no boastful defense will turn your obstacles into stepping stones.`,
      Moon: `Your Gnatikaraka is the Moon in ${k.signName} (House ${k.house}). Your primary challenges arise through fluctuating emotional states, psychological fatigue, or familial codependency. Cultivating healthy emotional detachment and shielding your nervous system from external negativity will bring resilience.`,
      Mars: `With Mars as your Gnatikaraka in ${k.signName} (House ${k.house}), you are tested through competitive rivalries, impulsive confrontations, and physical burnout. Your triumph lies in cooling the reactive temper, practicing tactical patience, and avoiding conflicts where nothing of value is gained.`,
      Mercury: `Your Gnatikaraka is Mercury in ${k.signName} (House ${k.house}). Obstacles manifest through communication misunderstandings, mental overstimulation, restless multitasking, and contractual ambiguities. Cultivating rigorous attention to detail and practicing quiet mental stillness will resolve these hurdles.`,
      Jupiter: `Your Gnatikaraka is Jupiter in ${k.signName} (House ${k.house}). Challenges can emerge from over-extending trust to unworthy individuals, dogmatic differences, or legal-financial overconfidence. Grounding your high optimism in pragmatic verification guards your well-being.`,
      Venus: `With Venus as your Gnatikaraka in ${k.signName} (House ${k.house}), relationship entanglements, financial indulgence, or compromising personal boundaries to preserve superficial peace form your karmic testing ground. Valuing self-worth over external approval is your liberation.`,
      Saturn: `Your Gnatikaraka is Saturn in ${k.signName} (House ${k.house}). You face tests of delay, systematic hurdles, chronic fatigue, or heavy burdens imposed by social circumstances. Remember that Saturn tests only to build diamond-like fortitude; steady persistence will outlast every impediment.`,
    };
    return challengeTypes[k.planetName] || challengeTypes['Saturn'];
  };

  // 5. PUTRAKARAKA (PK) - Creativity, Intellect & Children
  const getPkCreativeAnalysis = (k: CharaKarakaAssignment) => {
    return `Governed by your Putrakaraka (${k.planetName} in ${k.signName}, House ${k.house}), your creative intellect and relationship with progeny are blessed with ${k.planetName === 'Jupiter' ? 'profound philosophical depth and noble mentoring instincts' : k.planetName === 'Mercury' ? 'brilliant inventive adaptability and expressive flair' : k.planetName === 'Venus' ? 'artistic refinement and harmonious imagination' : k.planetName === 'Mars' ? 'bold engineering innovation and proactive drive' : k.planetName === 'Moon' ? 'poetic emotional resonance and intuitive storytelling' : k.planetName === 'Sun' ? 'original visionary leadership and bold creative sovereignty' : 'structured mastery and meticulous long-term craftsmanship'}. In Jaimini, the Putrakaraka represents the accumulation of your past-life good deeds (Purva Punya) blossoming through higher scholarship and creative output.`;
  };

  // 6. MATRIKARAKA (MK) - Home, Mother & Emotional Foundation
  const getMkHomeAnalysis = (k: CharaKarakaAssignment) => {
    return `Your Matrikaraka (${k.planetName} in ${k.signName}, House ${k.house}) anchors your emotional core, relationship with your mother, and domestic sanctuary. With ${k.planetName} governing your fourth karaka, you find restoration through ${k.planetName === 'Moon' || k.planetName === 'Venus' ? 'harmonious, peaceful, and beautifully appointed living spaces' : k.planetName === 'Jupiter' ? 'a spacious, ethical home filled with books and generous hospitality' : k.planetName === 'Saturn' ? 'quiet, orderly, and disciplined environments that offer privacy' : k.planetName === 'Mars' ? 'an active, physically vibrant, and securely protected property' : 'an intellectually stimulating, communicative home atmosphere'}. Your maternal figure holds a key influence on your moral grounding.`;
  };

  // 7. BHRATRIKARAKA (BK) - Courage, Siblings & Mentors
  const getBkSocialAnalysis = (k: CharaKarakaAssignment) => {
    return `Your Bhratrikaraka (${k.planetName} in ${k.signName}, House ${k.house}) governs your inner courage, peers, younger siblings, and guiding gurus. With ${k.planetName} as your BK, your mentors and closest comrades will mirror this planetary energy—inspiring you toward ${k.planetName === 'Jupiter' || k.planetName === 'Sun' ? 'higher ethical nobility and visionary wisdom' : k.planetName === 'Mars' ? 'fearless enterprise and physical resolve' : k.planetName === 'Mercury' ? 'collaborative intellectual exploration and shared curiosity' : k.planetName === 'Venus' ? 'diplomatic alliance and cultural refinement' : 'humble duty and enduring loyalty'}. You gain profound momentum when aligned with wise counselors.`;
  };

  const sections: InterpretationCategory[] = [
    {
      id: 'personality',
      category: 'Soul Purpose & Core Temperament',
      karakaName: 'Atmakaraka (AK)',
      karakaAbbr: 'AK',
      karakaPlanet: ak.planetName,
      karakaSign: ak.signName,
      karakaHouse: ak.house,
      theme: 'Governed by the Supreme Karaka',
      content: getAkPersonalityAnalysis(ak),
      actionableAdvice: `Honor your ${ak.planetName} Atmakaraka daily by aligning your decisions with its core virtues: integrity, conscious awareness, and purposeful dedication.`,
    },
    {
      id: 'career',
      category: 'Career & Professional Direction',
      karakaName: 'Amatyakaraka (AmK)',
      karakaAbbr: 'AmK',
      karakaPlanet: amk.planetName,
      karakaSign: amk.signName,
      karakaHouse: amk.house,
      theme: 'Minister of the Soul (Vocation)',
      content: getAmkCareerAnalysis(amk, ak),
      actionableAdvice: `Direct your career toward arenas where ${amk.planetName}'s natural intellect can be exercised freely without moral compromise.`,
    },
    {
      id: 'relationships',
      category: 'Marriage, Spouse & Relationships',
      karakaName: 'Darakaraka (DK)',
      karakaAbbr: 'DK',
      karakaPlanet: dk.planetName,
      karakaSign: dk.signName,
      karakaHouse: dk.house,
      theme: 'Union, Partnership & Spouse Archetype',
      content: getDkMarriageAnalysis(dk),
      actionableAdvice: `Seek a life companion who naturally embodies ${dk.planetName}'s highest qualities, ensuring a balanced, supportive union.`,
    },
    {
      id: 'challenges',
      category: 'Obstacles, Tests & Karmic Lessons',
      karakaName: 'Gnatikaraka (GK)',
      karakaAbbr: 'GK',
      karakaPlanet: gk.planetName,
      karakaSign: gk.signName,
      karakaHouse: gk.house,
      theme: 'Overcoming Friction & Competition',
      content: getGkChallengesAnalysis(gk),
      actionableAdvice: `Transform ${gk.planetName} friction into inner strength by meeting tests with calm detachment rather than reactive haste.`,
    },
    {
      id: 'creativity',
      category: 'Creativity, Intellect & Progeny',
      karakaName: 'Putrakaraka (PK)',
      karakaAbbr: 'PK',
      karakaPlanet: pk.planetName,
      karakaSign: pk.signName,
      karakaHouse: pk.house,
      theme: 'Creative Spark & Future Generations',
      content: getPkCreativeAnalysis(pk),
      actionableAdvice: `Engage in regular intellectual or creative output under ${pk.planetName}'s influence to unlock your accumulated intuitive gifts.`,
    },
    {
      id: 'family',
      category: 'Home, Mother & Emotional Grounding',
      karakaName: 'Matrikaraka (MK)',
      karakaAbbr: 'MK',
      karakaPlanet: mk.planetName,
      karakaSign: mk.signName,
      karakaHouse: mk.house,
      theme: 'Sanctuary, Peace & Maternal Blessings',
      content: getMkHomeAnalysis(mk),
      actionableAdvice: `Design your living space to reflect ${mk.planetName}'s soothing principles, ensuring an unshakeable emotional fortress.`,
    },
    {
      id: 'social',
      category: 'Courage, Siblings & Mentors',
      karakaName: 'Bhratrikaraka (BK)',
      karakaAbbr: 'BK',
      karakaPlanet: bk.planetName,
      karakaSign: bk.signName,
      karakaHouse: bk.house,
      theme: 'Camaraderie, Guidance & Initiative',
      content: getBkSocialAnalysis(bk),
      actionableAdvice: `Cultivate deliberate relationships with teachers and peers who mirror ${bk.planetName}'s wisdom and constructive drive.`,
    },
    {
      id: 'finances',
      category: 'Financial Tendencies & Wealth',
      karakaName: 'Amatyakaraka & Darakaraka Dynamics',
      karakaAbbr: 'AmK-DK',
      karakaPlanet: `${amk.planetName} & ${dk.planetName}`,
      karakaSign: `${amk.signName} / ${dk.signName}`,
      karakaHouse: amk.house,
      theme: 'Jaimini Wealth Generation Rules',
      content: `In the Jaimini system, wealth accumulation is deciphered through the relationship between your Amatyakaraka (${amk.planetName}) and Darakaraka (${dk.planetName}). Because ${amk.planetName} governs strategic commercial acumen and ${dk.planetName} represents commercial contracts and partnerships, their synergy indicates that wealth arrives through ${amk.planetName === 'Mercury' || amk.planetName === 'Venus' ? 'lucrative trade, media, negotiations, and strategic investments' : amk.planetName === 'Saturn' ? 'patient long-term capital accumulation, real estate, and foundational infrastructure' : amk.planetName === 'Jupiter' ? 'advisory leadership, institutional management, and ethical capital preservation' : 'bold enterprise, engineering innovation, and calculated risk'}. Maintaining fiscal transparency protects your growing abundance.`,
      actionableAdvice: 'Establish systematic, automated savings vehicles while leveraging your innate vocational strengths for active capital growth.',
    },
    {
      id: 'strengths',
      category: 'Natural Strengths & Talents',
      karakaName: 'Atmakaraka & Bhratrikaraka Alignment',
      karakaAbbr: 'AK-BK',
      karakaPlanet: `${ak.planetName} & ${bk.planetName}`,
      karakaSign: ak.signName,
      karakaHouse: ak.house,
      theme: 'Core Innate Capabilities',
      content: `Your paramount strengths emerge from the dual synergy of your Atmakaraka (${ak.planetName}) and Bhratrikaraka (${bk.planetName}). ${ak.planetName} provides you with an unshakeable moral compass and clarity of purpose, while ${bk.planetName} infuses you with the stamina and proactive initiative to follow through. You have a rare ability to stay centered when others panic and the inner dignity to pursue long-range objectives without seeking external applause.`,
      actionableAdvice: 'Trust your innate strategic intuition; your highest successes will arise when you back your own core principles.',
    },
    {
      id: 'growth-areas',
      category: 'Areas for Growth & Balance',
      karakaName: 'Gnatikaraka Counterbalance',
      karakaAbbr: 'GK',
      karakaPlanet: gk.planetName,
      karakaSign: gk.signName,
      karakaHouse: gk.house,
      theme: 'Transforming Vulnerability into Mastery',
      content: `Your chief area for growth is dictated by your Gnatikaraka (${gk.planetName} in ${gk.signName}). When under pressure, you may lean into ${gk.planetName === 'Mars' ? 'hasty irritation or aggressive defense' : gk.planetName === 'Mercury' ? 'nervous anxiety and overthinking' : gk.planetName === 'Moon' ? 'moodiness and emotional withdrawal' : gk.planetName === 'Sun' ? 'defensive pride and reluctance to seek counsel' : gk.planetName === 'Jupiter' ? 'over-promising or intellectual dogma' : gk.planetName === 'Venus' ? 'people-pleasing and compromising core values' : 'pessimistic burden-bearing'}. Recognizing these patterns allows you to intentionally cultivate patience and equanimity.`,
      actionableAdvice: 'When you notice these habitual reactions surfacing, pause for three conscious breaths before responding.',
    },
    {
      id: 'spirituality',
      category: 'Spiritual Evolution & Liberation',
      karakaName: 'Atmakaraka in Navamsa (Karakamsha)',
      karakaAbbr: 'AK',
      karakaPlanet: ak.planetName,
      karakaSign: ak.signName,
      karakaHouse: ak.house,
      theme: 'The Higher Spiritual Calling',
      content: `In the Jaimini Upadesha Sutras, spiritual evolution is illuminated by the Atmakaraka (${ak.planetName}). Your soul has journeyed through lifetimes to master the divine frequency of ${ak.planetName}. Your spiritual path is not one of escapism, but of living in the world with immaculate ethical integrity. Practicing meditation, studying timeless philosophical texts, and honoring universal benevolence will awaken your profound inner peace.`,
      actionableAdvice: 'Dedicate a quiet period at dawn or dusk for silent contemplation, offering your daily activities to the higher divine principle.',
    },
    {
      id: 'life-direction',
      category: 'Overall Life Trajectory & Destiny',
      karakaName: 'The Complete Karaka Mandala',
      karakaAbbr: 'AK-AmK-DK',
      karakaPlanet: `${ak.planetName} → ${amk.planetName} → ${dk.planetName}`,
      karakaSign: `${ak.signName} to ${dk.signName}`,
      karakaHouse: ak.house,
      theme: 'The Macro Life Horizon',
      content: `Your complete life trajectory represents an empowering journey from self-discovery (Atmakaraka: ${ak.planetName}) to external vocational mastery (Amatyakaraka: ${amk.planetName}) and relational fulfillment (Darakaraka: ${dk.planetName}). Over your lifespan, your initial trials (${gk.planetName}) will burn away superficial desires, leaving an enduring legacy of principled accomplishment, loving union, and profound self-mastery.`,
      actionableAdvice: 'Keep your focus anchored on long-term values; every experience is polishing your character into a brilliant, steadfast jewel.',
    },
  ];

  const archetypeTitleMap: { [p: string]: string } = {
    Sun: 'The Sovereign Visionary (Sun AK)',
    Moon: 'The Empathetic Anchor (Moon AK)',
    Mars: 'The Pioneering Catalyst (Mars AK)',
    Mercury: 'The Articulate Inquirer (Mercury AK)',
    Jupiter: 'The Wise Custodian (Jupiter AK)',
    Venus: 'The Harmonious Creator (Venus AK)',
    Saturn: 'The Dedicated Architect (Saturn AK)',
  };

  return {
    personalSummary: {
      fullName,
      lifeArchetype: archetypeTitleMap[ak.planetName] || `${ak.planetName} Atmakaraka Soul`,
      coreEssence: `Anchored by ${ak.planetName} as your Atmakaraka in ${ak.signName} (House ${ak.house}) and ${amk.planetName} as your Amatyakaraka, your life is an intentional quest for authentic self-expression, professional dignity, and relational harmony.`,
      keyThemes: [
        `Atmakaraka: ${ak.planetName}`,
        `Amatyakaraka: ${amk.planetName}`,
        `Darakaraka: ${dk.planetName}`,
        `Soul Sign: ${ak.signName}`,
      ],
      akPlanet: ak.planetName,
      amkPlanet: amk.planetName,
      dkPlanet: dk.planetName,
    },
    charaKarakasList: calculation.charaKarakas,
    sections,
    generatedAt: new Date().toISOString(),
  };
}
