import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Partner = {
  company_name: string;
  sector?: string;
  market?: string;
  country?: string;
  city?: string;
  description?: string;
  website?: string | null;
  is_verified?: boolean;
};

type Profile = {
  company_name: string;
  product_description: string;
  business_model?: string;
  target_continent?: string;
  target_country?: string;
  target_market?: string;
  sector: string;
  company_stage?: string;
  biggest_concern?: string;
};

type SearchBundle = {
  answer: string;
  results: Array<{
    title: string;
    content: string;
    url: string;
  }>;
};

const STARTER_PARTNERS: Partner[] = [
  {
    company_name: "Sonnen GmbH",
    sector: "Clean Energy",
    market: "Europe",
    country: "Germany",
    description: "Leading residential battery storage manufacturer, diversifying supply chain",
    website: "https://sonnen.de",
    is_verified: true,
  },
  {
    company_name: "BayWa r.e.",
    sector: "Clean Energy",
    market: "Europe",
    country: "Germany",
    description: "Europe largest solar distributor, sourcing Asian storage hardware",
    website: "https://baywa-re.com",
    is_verified: true,
  },
  {
    company_name: "Eneco",
    sector: "Clean Energy",
    market: "Europe",
    country: "Netherlands",
    description: "Dutch utility expanding residential battery program",
    website: "https://eneco.com",
    is_verified: true,
  },
  {
    company_name: "Rhenus Logistics",
    sector: "Robotics",
    market: "Europe",
    country: "Germany",
    description: "Large logistics operator investing heavily in warehouse automation",
    website: "https://rhenus.group",
    is_verified: true,
  },
  {
    company_name: "Stellantis",
    sector: "EV & Battery",
    market: "Europe",
    country: "Netherlands",
    description: "Major automotive group accelerating EV transition globally",
    website: "https://stellantis.com",
    is_verified: true,
  },
  {
    company_name: "Nexamp",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Community solar developer scaling across the US",
    website: "https://nexamp.com",
    is_verified: true,
  },
  {
    company_name: "Plug Power",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Hydrogen fuel cell company expanding product portfolio",
    website: "https://plugpower.com",
    is_verified: true,
  },
  {
    company_name: "Comau",
    sector: "Robotics",
    market: "Europe",
    country: "Italy",
    description: "Industrial automation system integrator distributing across Europe",
    website: "https://comau.com",
    is_verified: true,
  },
  {
    company_name: "Tier Mobility",
    sector: "Autonomous Driving",
    market: "Europe",
    country: "Germany",
    description: "Europe largest shared e-scooter operator, sourcing mobility tech",
    website: "https://tier.app",
    is_verified: true,
  },
  {
    company_name: "MediaMarkt",
    sector: "Consumer Tech",
    market: "Europe",
    country: "Germany",
    description: "Europe largest consumer electronics retailer, sourcing new brands",
    website: "https://mediamarkt.de",
    is_verified: true,
  },
  {
    company_name: "Sunrun",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Residential solar and storage provider with installer and hardware ecosystem",
    website: "https://sunrun.com",
    is_verified: false,
  },
  {
    company_name: "Sunnova",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Residential solar, battery storage, and energy services provider",
    website: "https://sunnova.com",
    is_verified: false,
  },
  {
    company_name: "Rockwell Automation",
    sector: "Robotics",
    market: "North America",
    country: "USA",
    description: "Industrial automation company serving North American manufacturers",
    website: "https://rockwellautomation.com",
    is_verified: false,
  },
  {
    company_name: "Best Buy",
    sector: "Consumer Tech",
    market: "North America",
    country: "USA",
    description: "Major North American consumer electronics retailer and channel partner",
    website: "https://bestbuy.com",
    is_verified: false,
  },
  {
    company_name: "ChargePoint",
    sector: "Autonomous Driving",
    market: "North America",
    country: "USA",
    description: "EV charging network and fleet electrification platform",
    website: "https://chargepoint.com",
    is_verified: false,
  },
];

const COMPETITOR_BANK = {
  Europe: [
    {
      company_name: "VARTA",
      country: "Germany",
      what_they_sell: "Battery storage systems and energy storage hardware for European buyers",
      who_they_target: "Installers, OEMs, distributors, and premium residential/commercial buyers",
      positioning: "Local European trust, documentation, and certification familiarity.",
      pricing_signal: "Premium",
      weakness: "Higher cost and slower customization create room for modular Asian suppliers with credible compliance.",
      threat_level: "High",
    },
    {
      company_name: "sonnen",
      country: "Germany",
      what_they_sell: "Residential battery storage systems and energy management solutions",
      who_they_target: "Residential installers, energy retailers, and distributed energy programs",
      positioning: "Strong brand, local service, and established European energy community.",
      pricing_signal: "Premium",
      weakness: "A focused entrant can compete in B2B channels where price, modularity, and fast delivery matter more than brand.",
      threat_level: "High",
    },
    {
      company_name: "Solarwatt",
      country: "Germany",
      what_they_sell: "Solar modules, storage, and home energy systems",
      who_they_target: "European installers and residential energy customers",
      positioning: "Integrated European clean-energy system provider.",
      pricing_signal: "Upper-mid market",
      weakness: "Less flexible for private-label or channel-specific hardware bundles.",
      threat_level: "Medium",
    },
  ],
  "North America": [
    {
      company_name: "Tesla Energy",
      country: "USA",
      what_they_sell: "Powerwall and commercial energy storage products for homes and businesses",
      who_they_target: "Residential installers, homeowners, utilities, and commercial energy buyers",
      positioning: "Category-defining brand with integrated software and installer demand.",
      pricing_signal: "Premium",
      weakness: "Channel partners may seek alternatives with better availability, margin, and customization.",
      threat_level: "Critical",
    },
    {
      company_name: "Enphase Energy",
      country: "USA",
      what_they_sell: "Microinverters, batteries, and home energy management systems",
      who_they_target: "Solar installers and residential energy channels",
      positioning: "Installer-trusted ecosystem with strong software and service support.",
      pricing_signal: "Premium",
      weakness: "A modular battery specialist can win where pack economics and integration flexibility matter.",
      threat_level: "High",
    },
    {
      company_name: "Generac",
      country: "USA",
      what_they_sell: "Backup power, battery storage, and distributed energy products",
      who_they_target: "Home energy dealers, installers, and commercial backup-power buyers",
      positioning: "Trusted North American backup-power brand with extensive dealer reach.",
      pricing_signal: "Upper-mid market",
      weakness: "Dealer channels may consider lower-cost storage hardware if warranty and support are credible.",
      threat_level: "High",
    },
  ],
};

const COUNTRY_OPTIONS: Record<string, string[]> = {
  Europe: [
    "Germany",
    "France",
    "Netherlands",
    "Italy",
    "United Kingdom",
    "Sweden",
    "Norway",
    "Spain",
    "Belgium",
    "Poland",
  ],
  "North America": ["United States", "Canada"],
  Both: ["United States", "Canada", "Germany", "France", "Netherlands", "United Kingdom"],
};

const COUNTRY_PARTNER_BANK: Record<string, Partner[]> = {
  germany: [
    { company_name: "Sonnen GmbH", sector: "Clean Energy", market: "Europe", country: "Germany", city: "Wildpoldsried", website: "https://sonnen.de", is_verified: true },
    { company_name: "BayWa r.e.", sector: "Clean Energy", market: "Europe", country: "Germany", city: "Munich", website: "https://baywa-re.com", is_verified: true },
    { company_name: "Rhenus Logistics", sector: "Robotics", market: "Europe", country: "Germany", city: "Holzwickede", website: "https://rhenus.group", is_verified: true },
    { company_name: "MediaMarkt", sector: "Consumer Tech", market: "Europe", country: "Germany", city: "Ingolstadt", website: "https://mediamarkt.de", is_verified: true },
    { company_name: "Bosch Rexroth", sector: "Robotics", market: "Europe", country: "Germany", city: "Lohr am Main", website: "https://boschrexroth.com", is_verified: false },
  ],
  france: [
    { company_name: "TotalEnergies", sector: "Clean Energy", market: "Europe", country: "France", city: "Paris", website: "https://totalenergies.com", is_verified: false },
    { company_name: "EDF Renewables", sector: "Clean Energy", market: "Europe", country: "France", city: "Paris", website: "https://edf-re.com", is_verified: false },
    { company_name: "Schneider Electric", sector: "Clean Energy", market: "Europe", country: "France", city: "Rueil-Malmaison", website: "https://se.com", is_verified: false },
    { company_name: "Renault Group", sector: "EV & Battery", market: "Europe", country: "France", city: "Boulogne-Billancourt", website: "https://renaultgroup.com", is_verified: false },
    { company_name: "Fnac Darty", sector: "Consumer Tech", market: "Europe", country: "France", city: "Ivry-sur-Seine", website: "https://fnacdarty.com", is_verified: false },
  ],
  netherlands: [
    { company_name: "Eneco", sector: "Clean Energy", market: "Europe", country: "Netherlands", city: "Rotterdam", website: "https://eneco.com", is_verified: true },
    { company_name: "Fastned", sector: "Clean Energy", market: "Europe", country: "Netherlands", city: "Amsterdam", website: "https://fastnedcharging.com", is_verified: false },
    { company_name: "Vanderlande", sector: "Robotics", market: "Europe", country: "Netherlands", city: "Veghel", website: "https://vanderlande.com", is_verified: false },
    { company_name: "Coolblue", sector: "Consumer Tech", market: "Europe", country: "Netherlands", city: "Rotterdam", website: "https://coolblue.nl", is_verified: false },
    { company_name: "Lightyear", sector: "Autonomous Driving", market: "Europe", country: "Netherlands", city: "Helmond", website: "https://lightyear.one", is_verified: false },
  ],
  italy: [
    { company_name: "Comau", sector: "Robotics", market: "Europe", country: "Italy", city: "Turin", website: "https://comau.com", is_verified: true },
    { company_name: "Enel X", sector: "Clean Energy", market: "Europe", country: "Italy", city: "Rome", website: "https://enelx.com", is_verified: false },
    { company_name: "A2A", sector: "Clean Energy", market: "Europe", country: "Italy", city: "Milan", website: "https://a2a.it", is_verified: false },
    { company_name: "Edison", sector: "Clean Energy", market: "Europe", country: "Italy", city: "Milan", website: "https://edison.it", is_verified: false },
    { company_name: "De'Longhi Group", sector: "Consumer Tech", market: "Europe", country: "Italy", city: "Treviso", website: "https://delonghigroup.com", is_verified: false },
  ],
  unitedkingdom: [
    { company_name: "Octopus Energy", sector: "Clean Energy", market: "Europe", country: "United Kingdom", city: "London", website: "https://octopus.energy", is_verified: false },
    { company_name: "Centrica", sector: "Clean Energy", market: "Europe", country: "United Kingdom", city: "Windsor", website: "https://centrica.com", is_verified: false },
    { company_name: "OVO Energy", sector: "Clean Energy", market: "Europe", country: "United Kingdom", city: "Bristol", website: "https://ovoenergy.com", is_verified: false },
    { company_name: "Currys", sector: "Consumer Tech", market: "Europe", country: "United Kingdom", city: "London", website: "https://currysplc.com", is_verified: false },
    { company_name: "Ocado Technology", sector: "Robotics", market: "Europe", country: "United Kingdom", city: "Hatfield", website: "https://ocadogroup.com", is_verified: false },
  ],
  sweden: [
    { company_name: "Vattenfall", sector: "Clean Energy", market: "Europe", country: "Sweden", city: "Solna", website: "https://vattenfall.com", is_verified: false },
    { company_name: "Polestar", sector: "EV & Battery", market: "Europe", country: "Sweden", city: "Gothenburg", website: "https://polestar.com", is_verified: false },
    { company_name: "Volvo Cars", sector: "EV & Battery", market: "Europe", country: "Sweden", city: "Gothenburg", website: "https://volvocars.com", is_verified: false },
    { company_name: "Elgiganten", sector: "Consumer Tech", market: "Europe", country: "Sweden", city: "Stockholm", website: "https://elgiganten.se", is_verified: false },
    { company_name: "ABB Sweden", sector: "Robotics", market: "Europe", country: "Sweden", city: "Vasteras", website: "https://global.abb", is_verified: false },
  ],
  norway: [
    { company_name: "Statkraft", sector: "Clean Energy", market: "Europe", country: "Norway", city: "Oslo", website: "https://statkraft.com", is_verified: false },
    { company_name: "Tibber", sector: "Clean Energy", market: "Europe", country: "Norway", city: "Forde", website: "https://tibber.com", is_verified: false },
    { company_name: "Equinor", sector: "Clean Energy", market: "Europe", country: "Norway", city: "Stavanger", website: "https://equinor.com", is_verified: false },
    { company_name: "Elkjop", sector: "Consumer Tech", market: "Europe", country: "Norway", city: "Oslo", website: "https://elkjop.no", is_verified: false },
    { company_name: "TOMRA", sector: "Robotics", market: "Europe", country: "Norway", city: "Asker", website: "https://tomra.com", is_verified: false },
  ],
  spain: [
    { company_name: "Iberdrola", sector: "Clean Energy", market: "Europe", country: "Spain", city: "Bilbao", website: "https://iberdrola.com", is_verified: false },
    { company_name: "Endesa X", sector: "Clean Energy", market: "Europe", country: "Spain", city: "Madrid", website: "https://endesa.com", is_verified: false },
    { company_name: "Acciona Energia", sector: "Clean Energy", market: "Europe", country: "Spain", city: "Madrid", website: "https://acciona-energia.com", is_verified: false },
    { company_name: "Wallbox", sector: "EV & Battery", market: "Europe", country: "Spain", city: "Barcelona", website: "https://wallbox.com", is_verified: false },
    { company_name: "Repsol", sector: "Clean Energy", market: "Europe", country: "Spain", city: "Madrid", website: "https://repsol.com", is_verified: false },
  ],
  belgium: [
    { company_name: "ENGIE Belgium", sector: "Clean Energy", market: "Europe", country: "Belgium", city: "Brussels", website: "https://engie.be", is_verified: false },
    { company_name: "Umicore", sector: "EV & Battery", market: "Europe", country: "Belgium", city: "Brussels", website: "https://umicore.com", is_verified: false },
    { company_name: "Fluvius", sector: "Clean Energy", market: "Europe", country: "Belgium", city: "Brussels", website: "https://fluvius.be", is_verified: false },
    { company_name: "Colruyt Group", sector: "Consumer Tech", market: "Europe", country: "Belgium", city: "Halle", website: "https://colruytgroup.com", is_verified: false },
    { company_name: "D'Ieteren", sector: "Autonomous Driving", market: "Europe", country: "Belgium", city: "Brussels", website: "https://dieteren.com", is_verified: false },
  ],
  poland: [
    { company_name: "PGE", sector: "Clean Energy", market: "Europe", country: "Poland", city: "Warsaw", website: "https://gkpge.pl", is_verified: false },
    { company_name: "Tauron", sector: "Clean Energy", market: "Europe", country: "Poland", city: "Katowice", website: "https://tauron.pl", is_verified: false },
    { company_name: "InPost", sector: "Robotics", market: "Europe", country: "Poland", city: "Krakow", website: "https://inpost.eu", is_verified: false },
    { company_name: "Allegro", sector: "Consumer Tech", market: "Europe", country: "Poland", city: "Poznan", website: "https://allegro.eu", is_verified: false },
    { company_name: "Solaris Bus & Coach", sector: "EV & Battery", market: "Europe", country: "Poland", city: "Bolechowo-Osiedle", website: "https://solarisbus.com", is_verified: false },
  ],
  unitedstates: [
    { company_name: "Sunrun", sector: "Clean Energy", market: "North America", country: "United States", city: "San Francisco", website: "https://sunrun.com", is_verified: false },
    { company_name: "Sunnova", sector: "Clean Energy", market: "North America", country: "United States", city: "Houston", website: "https://sunnova.com", is_verified: false },
    { company_name: "Nexamp", sector: "Clean Energy", market: "North America", country: "United States", city: "Boston", website: "https://nexamp.com", is_verified: true },
    { company_name: "Plug Power", sector: "Clean Energy", market: "North America", country: "United States", city: "Latham", website: "https://plugpower.com", is_verified: true },
    { company_name: "Best Buy", sector: "Consumer Tech", market: "North America", country: "United States", city: "Richfield", website: "https://bestbuy.com", is_verified: false },
  ],
  canada: [
    { company_name: "Hydro-Quebec", sector: "Clean Energy", market: "North America", country: "Canada", city: "Montreal", website: "https://hydroquebec.com", is_verified: false },
    { company_name: "Canadian Tire", sector: "Consumer Tech", market: "North America", country: "Canada", city: "Toronto", website: "https://canadiantire.ca", is_verified: false },
    { company_name: "Magna International", sector: "EV & Battery", market: "North America", country: "Canada", city: "Aurora", website: "https://magna.com", is_verified: false },
    { company_name: "Ballard Power Systems", sector: "Clean Energy", market: "North America", country: "Canada", city: "Burnaby", website: "https://ballard.com", is_verified: false },
    { company_name: "Brookfield Renewable", sector: "Clean Energy", market: "North America", country: "Canada", city: "Toronto", website: "https://bep.brookfield.com", is_verified: false },
  ],
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeName = (value: unknown) => normalize(value).replace(/[^a-z0-9]/g, "");

const countryKey = (value: unknown) => {
  const key = normalize(value).replace(/[^a-z0-9]/g, "");
  if (["usa", "us", "unitedstatesofamerica", "america"].includes(key)) return "unitedstates";
  if (["uk", "gb", "greatbritain", "britain", "unitedkingdom"].includes(key)) return "unitedkingdom";
  return key;
};

const canonicalMarket = (targetMarket?: string) => {
  const value = normalize(targetMarket);
  if (value.includes("north")) return "North America";
  if (value.includes("both")) return "Both";
  return "Europe";
};

const targetMarketForProfile = (profile: Pick<Profile, "target_continent" | "target_market">) =>
  canonicalMarket(profile.target_continent || profile.target_market);

const requestedCountryForProfile = (profile: Pick<Profile, "target_country" | "target_continent" | "target_market">) => {
  const target = targetMarketForProfile(profile);
  const country = String(profile.target_country || "").trim();

  if (!country || normalize(country) === "recommend" || target === "Both") return "";
  return country;
};

const defaultCountryForTarget = (targetMarket: string) => {
  if (targetMarket === "North America") return "United States";
  if (targetMarket === "Both") return "United States";
  return "Germany";
};

const countriesForTarget = (targetMarket: string) => COUNTRY_OPTIONS[targetMarket] || COUNTRY_OPTIONS.Europe;

const isCountryAllowedInTarget = (country: string, targetMarket: string) => {
  const key = countryKey(country);
  return countriesForTarget(targetMarket).some((allowed) => countryKey(allowed) === key);
};

const regionFromText = (value: unknown) => {
  const text = normalize(value);
  if (!text) return "";

  if (
    text.includes("north america") ||
    text.includes("usa") ||
    text.includes("u.s.") ||
    text.includes("united states") ||
    text.includes("america") ||
    text.includes("canada")
  ) {
    return "North America";
  }

  const europeanMarkers = [
    "europe",
    "germany",
    "france",
    "netherlands",
    "italy",
    "spain",
    "portugal",
    "uk",
    "united kingdom",
    "ireland",
    "switzerland",
    "austria",
    "belgium",
    "denmark",
    "sweden",
    "norway",
    "finland",
    "poland",
    "czech",
    "romania",
    "hungary",
    "greece",
    "luxembourg",
  ];

  return europeanMarkers.some((marker) => text.includes(marker)) ? "Europe" : "";
};

const itemRegion = (item: { market?: unknown; country?: unknown }) =>
  regionFromText(item.market) || regionFromText(item.country);

const isInTargetMarket = (item: { market?: unknown; country?: unknown }, targetMarket?: string) => {
  const target = canonicalMarket(targetMarket);
  const region = itemRegion(item);

  if (target === "Both") return region === "Europe" || region === "North America";
  return region === target;
};

const isInTargetCountry = (item: { country?: unknown }, targetCountry?: string) => {
  if (!targetCountry) return true;
  return countryKey(item.country) === countryKey(targetCountry);
};

const resolveCountryLock = (profile: Profile, report?: any) => {
  const target = targetMarketForProfile(profile);
  const requestedCountry = requestedCountryForProfile(profile);
  const recommendedCountry = String(report?.country_ranking?.recommended_country || report?.market_overview?.target_country || "").trim();
  const candidate = requestedCountry || recommendedCountry || defaultCountryForTarget(target);

  if (!candidate) return "";
  return isCountryAllowedInTarget(candidate, target) ? candidate : defaultCountryForTarget(target);
};

const regionInstruction = (targetMarket?: string, targetCountry?: string) => {
  const target = canonicalMarket(targetMarket);

  if (targetCountry) {
    return [
      `COUNTRY LOCK: The target country is "${targetCountry}".`,
      `Every company in icp_matches and competitor_intelligence must be based in ${targetCountry}.`,
      `The country_ranking.recommended_country and market_overview.target_country must be "${targetCountry}".`,
      "Do not mix in companies from other countries, even if they are in the same continent.",
    ].join("\n");
  }

  if (target === "North America") {
    return [
      'TARGET MARKET LOCK: "North America" means USA and Canada only.',
      "Do not include Germany, Netherlands, France, Italy, UK, Nordics, or any other European country in icp_matches or competitor_intelligence.",
      "Every country field must be USA, United States, or Canada.",
    ].join("\n");
  }

  if (target === "Both") {
    return [
      'TARGET MARKET LOCK: "Both" means Europe plus North America.',
      "icp_matches must contain at least 2 North American companies and at least 2 European companies.",
      "competitor_intelligence must include companies active in both regions, not only Europe.",
    ].join("\n");
  }

  return [
    'TARGET MARKET LOCK: "Europe" means EU countries, UK, Switzerland, Norway, and nearby European markets.',
    "Do not include USA or Canada in icp_matches or competitor_intelligence.",
    "Every country field must be a European country or Europe-specific market presence.",
  ].join("\n");
};

const sectorFitScore = (sector?: string, partnerSector?: string) => {
  const source = normalize(sector);
  const target = normalize(partnerSector);
  let score = 0;

  if (!source || !target) return score;
  if (source.includes(target) || target.includes(source)) score += 4;
  if (source.includes("clean") && target.includes("clean")) score += 4;
  if ((source.includes("battery") || source.includes("energy")) && (target.includes("battery") || target.includes("energy"))) score += 3;
  if (source.includes("robot") && target.includes("robot")) score += 4;
  if (source.includes("mobility") && (target.includes("mobility") || target.includes("autonomous"))) score += 4;
  if (source.includes("consumer") && target.includes("consumer")) score += 4;
  if ((source.includes("software") || source.includes("ai")) && (target.includes("software") || target.includes("ai"))) score += 4;

  return score;
};

const uniquePartners = (partners: Partner[]) => {
  const seen = new Set<string>();
  return partners.filter((partner) => {
    const key = normalizeName(partner.company_name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mergePartners = (partners: Partner[]) => uniquePartners([...STARTER_PARTNERS, ...partners]);

const getCountryPartners = (targetCountry?: string) => COUNTRY_PARTNER_BANK[countryKey(targetCountry)] || [];

const getRelevantPartners = (sector: string, targetMarket: string | undefined, partners: Partner[], targetCountry = "") =>
  mergePartners(partners)
    .filter((partner) => isInTargetMarket(partner, targetMarket))
    .filter((partner) => isInTargetCountry(partner, targetCountry))
    .map((partner) => ({
      partner,
      score: sectorFitScore(sector, partner.sector),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ partner }) => partner)
    .slice(0, 8);

const extractJsonObject = (value: unknown) => {
  const trimmed = String(value ?? "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) return trimmed;
  return trimmed.slice(first, last + 1);
};

const searchWeb = async (query: string, maxResults = 4): Promise<SearchBundle> => {
  const tavilyKey = Deno.env.get("TAVILY_API_KEY");
  if (!tavilyKey) return { answer: "", results: [] };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: "advanced",
        max_results: maxResults,
        include_answer: true,
        include_raw_content: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return { answer: "", results: [] };

    const data = await response.json();
    return {
      answer: data?.answer || "",
      results: Array.isArray(data?.results)
        ? data.results.slice(0, maxResults).map((result: any) => ({
          title: String(result.title || "Untitled source"),
          content: String(result.content || "").slice(0, 500),
          url: String(result.url || ""),
        }))
        : [],
    };
  } catch {
    return { answer: "", results: [] };
  }
};

const formatSearch = (label: string, data: SearchBundle) => {
  const lines = data.results.map((result) =>
    `- ${result.title}: ${result.content}${result.url ? ` (${result.url})` : ""}`
  );

  return [
    `[${label}]`,
    `Summary: ${data.answer || "No direct answer returned."}`,
    ...lines,
  ].join("\n");
};

const collectLiveResearch = async (profile: Profile, targetMarket: string, targetCountry: string) => {
  const scope = targetCountry || targetMarket;
  const countryMode = targetCountry
    ? `${profile.sector} market ${targetCountry} opportunities growth 2025 2026`
    : `best country ${targetMarket} ${profile.sector} market entry Chinese companies 2025 2026`;

  const [marketData, competitorData, regulatoryData, countryData, buyerData] = await Promise.all([
    searchWeb(`${profile.sector} market size growth ${scope} 2025 2026`),
    searchWeb(`top ${profile.sector} companies ${scope} suppliers market leaders 2025`),
    searchWeb(`${profile.sector} regulations certification requirements ${scope} 2025 2026`),
    searchWeb(countryMode),
    searchWeb(`${profile.sector} procurement buyers ${scope} supplier requirements 2025`),
  ]);

  const totalResults = [
    marketData,
    competitorData,
    regulatoryData,
    countryData,
    buyerData,
  ].reduce((sum, bundle) => sum + bundle.results.length, 0);

  return {
    enabled: Boolean(Deno.env.get("TAVILY_API_KEY")),
    totalResults,
    text: [
      formatSearch("MARKET SIZE & TRENDS", marketData),
      formatSearch("COMPETITOR LANDSCAPE", competitorData),
      formatSearch("REGULATORY ENVIRONMENT", regulatoryData),
      formatSearch("COUNTRY INTELLIGENCE", countryData),
      formatSearch("BUYER BEHAVIOR & PROCUREMENT", buyerData),
    ].join("\n\n"),
  };
};

const fallbackPartnersForTarget = (profile: Profile, partners: Partner[], targetCountry = "") => {
  const target = targetMarketForProfile(profile);
  const relevant = getRelevantPartners(profile.sector, target, partners, targetCountry);
  const defaults = target === "North America"
    ? STARTER_PARTNERS.filter((partner) => partner.market === "North America")
    : target === "Both"
    ? STARTER_PARTNERS.filter((partner) => partner.market === "North America" || partner.market === "Europe")
    : STARTER_PARTNERS.filter((partner) => partner.market === "Europe");

  const eligible = uniquePartners([...relevant, ...getCountryPartners(targetCountry), ...defaults, ...STARTER_PARTNERS]).filter((partner) =>
    isInTargetMarket(partner, target)
  );

  const countryEligible = targetCountry
    ? eligible.filter((partner) => isInTargetCountry(partner, targetCountry))
    : eligible;

  if (target !== "Both" || targetCountry) return countryEligible.slice(0, 5);

  const europe = countryEligible.filter((partner) => itemRegion(partner) === "Europe");
  const northAmerica = countryEligible.filter((partner) => itemRegion(partner) === "North America");

  return uniquePartners([
    europe[0],
    northAmerica[0],
    europe[1],
    northAmerica[1],
    europe[2],
    northAmerica[2],
  ].filter(Boolean) as Partner[]).slice(0, 5);
};

const createMatchFromPartner = (profile: Profile, partner: Partner, index: number) => {
  const base = [88, 84, 81, 78, 75][index] || 74;
  const scores = {
    product_fit: Math.max(16, 23 - Math.floor(index / 2)),
    market_readiness: Math.max(16, 22 - Math.floor(index / 2)),
    strategic_value: Math.max(16, 23 - index),
    accessibility: Math.max(15, 21 - index),
    overall: base,
  };

  return {
    rank: index + 1,
    company_name: partner.company_name,
    is_verified: Boolean(partner.is_verified),
    website: partner.website || null,
    country: partner.country || (partner.market === "North America" ? "USA" : "Germany"),
    sector: partner.sector || profile.sector,
    company_size: index < 2 ? "1,000-5,000 employees" : "200-1,000 employees",
    city: partner.city || "",
    why_they_match: `${partner.company_name} fits ${profile.company_name} because it operates in the exact ${partner.country || targetMarketForProfile(profile)} channel where the product needs early proof. The strongest entry angle is a low-risk pilot backed by certification evidence, delivery reliability, and clear local support.`,
    what_they_are_replacing: "A higher-cost incumbent supplier, manual procurement process, or less flexible local alternative.",
    decision_maker_title: index < 2 ? "Strategic Procurement Manager" : "Head of Partnerships",
    buying_trigger: profile.biggest_concern
      ? `The likely buying objection is ${profile.biggest_concern}; a concrete certification and pilot plan turns that risk into a credible first conversation.`
      : "The company is exposed to supplier diversification, energy transition, or automation pressure in its local market.",
    buying_signal_status: index < 2 ? "warm" : "cool",
    scores,
    why_they_might_say_no: "They may worry about certification, local support, warranty execution, and supplier continuity.",
    how_to_overcome_it: "Lead with third-party certification evidence, local support plan, pilot terms, and a named escalation owner.",
    first_move: `Send ${partner.company_name} a one-page technical dossier, certification roadmap, and a proposed 20-minute pilot-fit call this week.`,
    reference_value: "A credible local reference that reduces risk for similar buyers in the same country.",
  };
};

const normalizeReport = (report: any, profile: Profile, partners: Partner[]) => {
  const target = targetMarketForProfile(profile);
  const countryLock = resolveCountryLock(profile, report);
  const partnerByName = new Map(
    mergePartners(partners).map((partner) => [normalizeName(partner.company_name), partner]),
  );

  const cleanMatches = Array.isArray(report?.icp_matches)
    ? report.icp_matches.filter((match: any) => isInTargetMarket(match, target) && isInTargetCountry(match, countryLock))
    : [];

  const fallbackMatches = fallbackPartnersForTarget(profile, partners, countryLock).map((partner, index) =>
    createMatchFromPartner(profile, partner, cleanMatches.length + index)
  );

  const seenMatches = new Set<string>();
  const allMatches = [...cleanMatches, ...fallbackMatches]
    .filter((match: any) => {
      const key = normalizeName(match.company_name);
      if (!key || seenMatches.has(key)) return false;
      seenMatches.add(key);
      return isInTargetMarket(match, target) && isInTargetCountry(match, countryLock);
    });

  const balancedMatches = [
      allMatches.find((match: any) => itemRegion(match) === "Europe"),
      allMatches.find((match: any) => itemRegion(match) === "North America"),
      ...allMatches.filter((match: any) => itemRegion(match) === "Europe").slice(1, 3),
      ...allMatches.filter((match: any) => itemRegion(match) === "North America").slice(1, 3),
    ].filter(Boolean) as Partner[];

  const selectedMatches = countryLock
    ? allMatches.slice(0, 5)
    : target === "Both"
    ? uniquePartners(balancedMatches).slice(0, 5)
    : allMatches.slice(0, 5);

  const icp_matches = selectedMatches
    .map((match: any, index: number) => {
      const verified = partnerByName.get(normalizeName(match.company_name));
      const scores = match.scores || {};
      const overall =
        Number(scores.overall) ||
        Number(scores.product_fit || 0) +
          Number(scores.market_readiness || 0) +
          Number(scores.strategic_value || 0) +
          Number(scores.accessibility || 0);

      return {
        ...match,
        rank: index + 1,
        is_verified: Boolean(match.is_verified || verified?.is_verified),
        website: match.website || verified?.website || null,
        country: match.country || verified?.country || (target === "North America" ? "USA" : "Germany"),
        city: match.city || verified?.city || "",
        sector: match.sector || verified?.sector || profile.sector,
        buying_signal_status: match.buying_signal_status || (index < 2 ? "warm" : "cool"),
        scores: {
          product_fit: Number(scores.product_fit) || 20,
          market_readiness: Number(scores.market_readiness) || 20,
          strategic_value: Number(scores.strategic_value) || 20,
          accessibility: Number(scores.accessibility) || 18,
          overall: overall || 78,
        },
      };
    });

  const countryCompetitors = getCountryPartners(countryLock).slice(0, 3).map((partner) => ({
    company_name: partner.company_name,
    country: partner.country || countryLock,
    what_they_sell: `${partner.sector || profile.sector} products, channels, or local partner access`,
    who_they_target: "Local enterprise buyers, installers, distributors, and procurement teams",
    positioning: "Local credibility and lower execution risk.",
    pricing_signal: "Not publicly disclosed",
    weakness: "Less flexible for startup-specific pilots and custom commercial packaging.",
    customer_complaints: "Buyers may report limited customization, high cost, or slow enterprise response.",
    how_to_beat_them: "Win with a narrower pilot, stronger unit economics, and faster technical customization.",
    threat_level: "Medium",
  }));

  const competitorSource = countryLock
    ? countryCompetitors
    : target === "Both"
    ? [...COMPETITOR_BANK["North America"].slice(0, 2), ...COMPETITOR_BANK.Europe.slice(0, 2)]
    : COMPETITOR_BANK[target as "Europe" | "North America"];

  const cleanCompetitors = Array.isArray(report?.competitor_intelligence)
    ? report.competitor_intelligence.filter((competitor: any) =>
      target === "Both"
        ? isInTargetCountry(competitor, countryLock) || isInTargetMarket(competitor, "Europe") || isInTargetMarket(competitor, "North America")
        : isInTargetMarket(competitor, target) && isInTargetCountry(competitor, countryLock)
    )
    : [];

  const seenCompetitors = new Set<string>();
  const allCompetitors = [...cleanCompetitors, ...competitorSource]
    .filter((competitor: any) => {
      const key = normalizeName(competitor.company_name);
      if (!key || seenCompetitors.has(key)) return false;
      seenCompetitors.add(key);
      return target === "Both"
        ? isInTargetCountry(competitor, countryLock) || isInTargetMarket(competitor, "Europe") || isInTargetMarket(competitor, "North America")
        : isInTargetMarket(competitor, target) && isInTargetCountry(competitor, countryLock);
    });

  const selectedCompetitors = countryLock
    ? allCompetitors.filter((competitor: any) => isInTargetCountry(competitor, countryLock)).slice(0, 3)
    : target === "Both"
    ? [
      allCompetitors.find((competitor: any) => itemRegion(competitor) === "Europe"),
      allCompetitors.find((competitor: any) => itemRegion(competitor) === "North America"),
      ...allCompetitors.filter((competitor: any) => itemRegion(competitor) === "Europe").slice(1, 2),
      ...allCompetitors.filter((competitor: any) => itemRegion(competitor) === "North America").slice(1, 2),
    ].filter(Boolean).slice(0, 3)
    : allCompetitors.slice(0, 3);

  const competitor_intelligence = selectedCompetitors
    .map((competitor: any, index: number) => ({
      rank: index + 1,
      company_name: competitor.company_name,
      country: competitor.country || (target === "North America" ? "USA" : "Germany"),
      what_they_sell: competitor.what_they_sell || "Competing products and services in the target market",
      who_they_target: competitor.who_they_target || "Enterprise buyers, channel partners, and procurement teams",
      positioning: competitor.positioning || "Established local trust and lower perceived market-entry risk.",
      pricing_signal: competitor.pricing_signal || null,
      weakness: competitor.weakness || "Less flexibility on customization, economics, or channel-specific pilot structure.",
      recent_news: competitor.recent_news || "Validate with live monitoring before outreach.",
      customer_complaints: competitor.customer_complaints || "Potential complaints often center on price, speed, customization, or service responsiveness.",
      how_to_beat_them: competitor.how_to_beat_them || "Use a sharper pilot wedge, better economics, and stronger technical responsiveness.",
      threat_level: competitor.threat_level || "Medium",
    }));

  const weeks = Array.isArray(report?.action_plan?.weeks) && report.action_plan.weeks.length
    ? report.action_plan.weeks
    : [
      {
        period: "Week 1-2",
        theme: "Compliance & Market Lock",
        actions: [
          `Validate requirements for ${target} before broad outreach.`,
          "Define the first buyer segment and country/state beachhead.",
          "Prepare a buyer-ready technical and commercial dossier.",
        ],
        milestone: "The first target segment and compliance blockers are clear.",
      },
      {
        period: "Week 3-4",
        theme: "Partner Targeting",
        actions: [
          "Build a 30-account partner list in the selected market.",
          "Map procurement, technical, and partnership decision makers.",
          "Create three localized outreach angles.",
        ],
        milestone: "Top accounts and decision makers are ready for outbound.",
      },
      {
        period: "Week 5-6",
        theme: "Pilot Offer",
        actions: [
          "Define sample terms, support SLA, testing criteria, and success metrics.",
          "Start outreach to the first 10 accounts.",
          "Track objections and update sales materials.",
        ],
        milestone: "At least five qualified partner conversations are active.",
      },
      {
        period: "Week 7-8",
        theme: "Technical Validation",
        actions: [
          "Share technical files under NDA with qualified prospects.",
          "Run engineering and procurement review calls.",
          "Convert repeated objections into FAQ and evidence materials.",
        ],
        milestone: "Two prospects enter technical evaluation.",
      },
      {
        period: "Week 9-10",
        theme: "Commercial Setup",
        actions: [
          "Finalize landed cost, warranty, payment, and pilot volume assumptions.",
          "Identify local support, logistics, or service partners.",
          "Negotiate one pilot agreement with clear conversion criteria.",
        ],
        milestone: "A pilot agreement is drafted or in final review.",
      },
      {
        period: "Week 11-12",
        theme: "Board-Ready Decision",
        actions: [
          "Summarize traction, objections, conversion probability, and budget.",
          "Decide whether to double down, adjust the segment, or pause for compliance.",
          "Create the next 6-month operating plan.",
        ],
        milestone: "Leadership has a go/no-go decision and execution plan.",
      },
    ];

  const requestedCountry = requestedCountryForProfile(profile);
  const rankingCountries = requestedCountry
    ? [requestedCountry]
    : countriesForTarget(target);
  const existingRankings = Array.isArray(report?.country_ranking?.rankings)
    ? report.country_ranking.rankings
    : [];
  const rankings = rankingCountries.map((country, index) => {
    const existing = existingRankings.find((entry: any) => countryKey(entry?.country) === countryKey(country));
    const score = Number(existing?.overall_score) || Math.max(62, 88 - index * 5);

    return {
      country,
      overall_score: score,
      scores: {
        market_size: Number(existing?.scores?.market_size) || Math.max(10, 18 - Math.floor(index / 2)),
        competition_level: Number(existing?.scores?.competition_level) || Math.max(9, 16 - Math.floor(index / 2)),
        regulatory_ease: Number(existing?.scores?.regulatory_ease) || Math.max(8, 15 - Math.floor(index / 3)),
        cultural_receptiveness: Number(existing?.scores?.cultural_receptiveness) || Math.max(9, 16 - Math.floor(index / 2)),
        infrastructure: Number(existing?.scores?.infrastructure) || Math.max(10, 18 - Math.floor(index / 2)),
      },
      one_line_verdict:
        existing?.one_line_verdict ||
        `${country} is scored for market access, buyer density, channel quality, and compliance practicality.`,
      best_for: existing?.best_for || `${profile.sector} startups that need a focused first-country beachhead.`,
      main_challenge: existing?.main_challenge || "Requires local proof, buyer trust, and country-specific compliance validation.",
    };
  }).sort((a, b) => b.overall_score - a.overall_score);

  const recommendedCountry = requestedCountry || countryLock || rankings[0]?.country || defaultCountryForTarget(target);

  const country_ranking = {
    recommended_country: recommendedCountry,
    reasoning:
      report?.country_ranking?.reasoning ||
      `${recommendedCountry} is the best first entry point because it concentrates relevant buyers, channel partners, and validation opportunities for ${profile.sector}. The plan should focus on one country first so compliance, references, and partner outreach can compound instead of spreading effort across the whole continent.`,
    entry_advantage:
      report?.country_ranking?.entry_advantage ||
      `A focused ${recommendedCountry} beachhead gives ${profile.company_name} clearer buyer targeting and faster reference-building than a broad regional launch.`,
    rankings,
  };

  const market_overview = {
    target_country: report?.market_overview?.target_country || recommendedCountry,
    target_continent: report?.market_overview?.target_continent || target,
    market_size: report?.market_overview?.market_size || "Validate with live sources during final outreach planning.",
    growth_rate: report?.market_overview?.growth_rate || "Growth estimate pending live source confirmation.",
    key_trend: report?.market_overview?.key_trend || `${target} buyers are prioritizing lower-risk suppliers with clear compliance and local support.`,
    urgency_signal: report?.market_overview?.urgency_signal || "Procurement urgency depends on certification, incentive, and supply-chain timing in the selected country.",
    best_subsector: report?.market_overview?.best_subsector || profile.sector,
    typical_sales_cycle: report?.market_overview?.typical_sales_cycle || "3-6 months for first qualified pilot, longer for enterprise-scale procurement.",
    average_deal_size: report?.market_overview?.average_deal_size || "Pilot-dependent; estimate after first distributor or integrator validation.",
    buyer_journey: report?.market_overview?.buyer_journey || "Technical teams validate fit, procurement checks risk, and leadership approves pilot economics.",
  };

  const buyer_psychology = {
    primary_fear:
      report?.buyer_psychology?.primary_fear ||
      "Western buyers worry that a Chinese supplier may create certification, warranty, support, or continuity risk after the first order.",
    trust_builders: Array.isArray(report?.buyer_psychology?.trust_builders)
      ? report.buyer_psychology.trust_builders.slice(0, 3)
      : ["Third-party certification evidence", "Local support and escalation plan", "Referenceable pilot with clear success metrics"],
    top_objections: Array.isArray(report?.buyer_psychology?.top_objections)
      ? report.buyer_psychology.top_objections.slice(0, 3)
      : ["Can you meet local certification requirements?", "Who handles support and warranty?", "Why switch from an established supplier?"],
    winning_pitch_angle:
      report?.buyer_psychology?.winning_pitch_angle ||
      "Position the offer as a lower-risk pilot with measurable economics, documented compliance path, and faster customization.",
  };

  const distribution_channels = {
    recommended_channel: report?.distribution_channels?.recommended_channel || "Specialized distributor or system integrator first",
    reasoning:
      report?.distribution_channels?.reasoning ||
      "A local channel partner compresses trust-building, reduces support anxiety, and gives the startup access to qualified end buyers.",
    top_partners: Array.isArray(report?.distribution_channels?.top_partners)
      ? report.distribution_channels.top_partners.slice(0, 3)
      : [
        { type: "Distributor", examples: `Country-specific ${profile.sector} distributors`, why: "Fastest path to existing buyer demand." },
        { type: "System integrator", examples: "Installation and integration partners", why: "Reduces implementation risk for enterprise buyers." },
        { type: "Reference customer", examples: "One visible early adopter", why: "Creates credibility for the next ten accounts." },
      ],
    time_to_first_revenue: report?.distribution_channels?.time_to_first_revenue || "90-180 days after qualified partner validation.",
  };

  const regulatory_snapshot = {
    certifications: Array.isArray(report?.regulatory_snapshot?.certifications)
      ? report.regulatory_snapshot.certifications.slice(0, 4)
      : [
        {
          name: "Country-specific compliance review",
          mandatory: true,
          timeline: "2-6 weeks to scope before outreach",
          cost: "Advisor-dependent",
          body: "Local certification advisor or accredited test lab",
          priority: "Immediate",
        },
      ],
    biggest_risk:
      report?.regulatory_snapshot?.biggest_risk ||
      "Starting partner outreach before proving the compliance path can create avoidable trust loss.",
    timeline_impact:
      report?.regulatory_snapshot?.timeline_impact ||
      "Compliance uncertainty can add 3-9 months to enterprise procurement if discovered late.",
  };

  return {
    country_ranking,
    market_overview,
    company_summary: {
      name: report?.company_summary?.name || profile.company_name,
      one_line_pitch:
        report?.company_summary?.one_line_pitch ||
        `${profile.company_name} helps ${target} buyers adopt ${profile.product_description} through a ${profile.business_model || "B2B"} partnership model.`,
      market_readiness_score: Number(report?.company_summary?.market_readiness_score) || 76,
      market_readiness_label: report?.company_summary?.market_readiness_label || "Ready",
      critical_insight:
        report?.company_summary?.critical_insight ||
        `The market-entry plan must be built around ${target}, not generic Western expansion.`,
      biggest_blind_spot:
        report?.company_summary?.biggest_blind_spot ||
        `The biggest blind spot is treating ${target} as one market instead of building country-level proof in ${recommendedCountry}.`,
      unfair_advantage:
        report?.company_summary?.unfair_advantage ||
        "Speed, manufacturing flexibility, and economics can become an advantage if compliance and local support are made credible.",
    },
    buyer_psychology,
    icp_matches,
    competitor_intelligence,
    distribution_channels,
    regulatory_snapshot,
    action_plan: {
      market_entry_timeline: report?.action_plan?.market_entry_timeline || "6-9 months",
      recommended_country: report?.action_plan?.recommended_country || recommendedCountry,
      weeks,
      critical_path:
        report?.action_plan?.critical_path ||
        `Validate ${recommendedCountry} compliance and channel access before scaling outbound to the wider ${target} market.`,
      first_action_tomorrow:
        report?.action_plan?.first_action_tomorrow ||
        `Validate the top compliance and channel blocker for ${recommendedCountry} before sending broad partner outreach.`,
    },
    risk_assessment: Array.isArray(report?.risk_assessment) && report.risk_assessment.length
      ? report.risk_assessment.slice(0, 3).map((risk: any, index: number) => ({
        rank: index + 1,
        risk_title: risk.risk_title || "Market-entry execution risk",
        risk_type: risk.risk_type || "Operational",
        severity: risk.severity || "High",
        description: risk.description || `This risk is specific to entering ${target} with limited local proof.`,
        early_warning_sign: risk.early_warning_sign || "Qualified buyers ask for documents, local support, or certifications before discussing a pilot.",
        probability: risk.probability || "Medium",
        mitigation: risk.mitigation || "Validate requirements with local experts and qualified partners before scaling outreach.",
        cost_of_ignoring: risk.cost_of_ignoring || "Delayed market entry, weak conversion, and wasted outreach cycles.",
        timeline_to_impact: risk.timeline_to_impact || "Usually visible within the first 30-60 days of partner outreach.",
      }))
      : [
        {
          rank: 1,
          risk_title: "Wrong-region market assumptions",
          risk_type: "Operational",
          severity: "High",
          description: `Using European assumptions for ${target} can distort partner targeting, compliance planning, and competitive positioning.`,
          probability: "High",
          mitigation: `Build the first account list, certification checklist, and competitor map specifically for ${target}.`,
          cost_of_ignoring: "Low reply rates, delayed pilots, and a board plan that does not match the actual target market.",
          early_warning_sign: "Partner replies ask basic country-specific compliance questions that the company cannot answer.",
          timeline_to_impact: "Immediate: this can block the first 4-8 weeks of outreach.",
        },
      ],
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const profile = await req.json() as Profile;
    const {
      company_name,
      product_description,
      business_model,
      target_continent,
      target_country,
      target_market,
      sector,
      company_stage,
      biggest_concern,
    } = profile;

    if (!company_name || !product_description || !sector) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const orbitKey = Deno.env.get("ORBIT_API_KEY");

    let dbPartners: Partner[] = [];
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("partners").select("*").limit(50);
      if (Array.isArray(data)) dbPartners = data;
    }

    const target = targetMarketForProfile(profile);
    const requestedCountry = requestedCountryForProfile(profile);
    const vettedPartners = getRelevantPartners(sector, target, dbPartners, requestedCountry);
    const liveResearch = await collectLiveResearch(profile, target, requestedCountry);

    if (!orbitKey) {
      const report = normalizeReport({}, profile, dbPartners);
      return new Response(JSON.stringify({ ...report, _meta: { source: "fallback", reason: "missing_orbit_api_key" } }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are WestReady, an elite GTM strategist specialized in helping Chinese startups enter Western markets.

${regionInstruction(target, requestedCountry)}

VETTED PARTNERS DATABASE:
This database has already been filtered for target market "${target}". Prioritize these partners only when sector and product fit are credible:
${JSON.stringify(vettedPartners)}

LIVE MARKET RESEARCH:
The following search data was gathered seconds before this report.
Search enabled: ${liveResearch.enabled ? "yes" : "no"}
Search results available: ${liveResearch.totalResults}

${liveResearch.text}

BEHAVIOR RULES:
- Return ONLY valid JSON. No markdown fences, no preamble, no explanation.
- Every insight must be specific to this exact company. No generic advice.
- The target market is "${target}". This overrides all other instructions and all prior examples.
- Target country mode is "${requestedCountry || "AI recommend best country"}".
- Use live market research as the primary evidence source when search results are available.
- Every country recommendation, ICP match, competitor, regulation, and channel suggestion must reflect the selected country logic.
- Do not include companies outside "${requestedCountry || target}" in icp_matches or competitor_intelligence.
- For North America, use USA/Canada partners and competitors only.
- For Europe, use European partners and competitors only.
- For Both, mix Europe and North America; do not return a Europe-only list.
- All score fields must be numbers, not strings.
- For icp_matches: list filtered vetted partners first if they fit sector and market, then add AI-generated matches to reach 5 total. Set is_verified false for AI-generated.
- If target country is AI recommend, first pick one recommended_country, then make all ICP matches and competitors come from that country.

TINDER SCORING SYSTEM:
Score each ICP match across 4 dimensions, 0-25 each:
- product_fit: How precisely does their procurement need match this product?
- market_readiness: Are they actively buying this category right now?
- strategic_value: Is winning them a reference that opens more doors?
- accessibility: Can a Chinese startup realistically reach and close them?
overall = sum of all 4, 0-100.

BUYING SIGNAL CLASSIFICATION:
"hot" = Active tender, job posting for procurement role, or public sourcing statement
"warm" = Recent funding, expansion announcement, or competitor made similar purchase
"cool" = General market growth signal only
"none" = No active signal detected

OUTPUT CONTRACT:
Return one compact JSON object with these top-level keys:
country_ranking, market_overview, company_summary, buyer_psychology,
icp_matches, competitor_intelligence, distribution_channels,
regulatory_snapshot, action_plan, risk_assessment.

Keep string values concise. Prefer one sentence per field.`;

    const userPrompt = `Analyze this Chinese startup and generate the complete live Market Entry Intelligence Report.

TARGET CONTINENT: ${target_continent || target_market || target}
TARGET COUNTRY: ${requestedCountry || "Let AI recommend the best single country"}
CANONICAL TARGET MARKET: ${target}
${regionInstruction(target, requestedCountry)}

COUNTRIES TO SCORE:
${requestedCountry ? requestedCountry : countriesForTarget(target).join(", ")}

COMPANY PROFILE:
Name: ${company_name}
Product: ${product_description}
Business Model: ${business_model || "N/A"}
Sector: ${sector}
Stage: ${company_stage || "N/A"}
Biggest Concern: ${biggest_concern || "Market entry barriers"}

ANALYSIS TASKS:
1. If country is "Let AI recommend", score every country listed above and choose one recommended_country.
2. If a specific country is provided, make that country the recommended_country and do a deep country analysis.
3. All ICP matches and competitors must be based in the recommended_country.
4. Use the live market research provided in the system prompt when available.
5. Generate exactly 5 icp_matches, 3 competitor_intelligence entries, 6 action_plan weeks, and 3 risk_assessment entries.

REQUIRED TOP-LEVEL JSON KEYS:
country_ranking, market_overview, company_summary, buyer_psychology, icp_matches,
competitor_intelligence, distribution_channels, regulatory_snapshot, action_plan, risk_assessment.

The JSON must include:
- country_ranking.recommended_country, reasoning, entry_advantage, rankings[]
- market_overview.target_country, target_continent, market_size, growth_rate, key_trend, urgency_signal, best_subsector, typical_sales_cycle, average_deal_size, buyer_journey
- company_summary.name, one_line_pitch, market_readiness_score, market_readiness_label, critical_insight, biggest_blind_spot, unfair_advantage
- buyer_psychology.primary_fear, trust_builders[], top_objections[], winning_pitch_angle
- icp_matches[] with city, what_they_are_replacing, why_they_might_say_no, how_to_overcome_it, reference_value
- competitor_intelligence[] with recent_news, customer_complaints, how_to_beat_them
- distribution_channels.recommended_channel, reasoning, top_partners[], time_to_first_revenue
- regulatory_snapshot.certifications[], biggest_risk, timeline_impact
- action_plan.recommended_country, weeks[].cost_estimate, weeks[].key_contact_type, critical_path
- risk_assessment[].early_warning_sign and timeline_to_impact

Return ONLY the JSON object. Nothing else.`;

    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${orbitKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const report = normalizeReport({}, profile, dbPartners);
      return new Response(JSON.stringify({ ...report, _meta: { source: "fallback", reason: `orbit_http_${response.status}` } }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const rawContent = aiData?.choices?.[0]?.message?.content;
    let parsed = {};
    try {
      parsed = rawContent ? JSON.parse(extractJsonObject(rawContent)) : {};
    } catch {
      parsed = {};
    }
    const report = normalizeReport(parsed, profile, dbPartners);

    return new Response(JSON.stringify({
      ...report,
      _meta: {
        source: rawContent && Object.keys(parsed).length ? "ai" : "fallback",
        target_market: target,
        target_country: resolveCountryLock(profile, parsed),
        search_enabled: liveResearch.enabled,
        search_results: liveResearch.totalResults,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
