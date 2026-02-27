import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
}

interface TravelContext {
  from: string | null;
  to: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Bus-schedule generator ───────────────────────────────────────────────────

function nextDepartures(): string {
  const now = new Date();
  const times: string[] = [];
  let h = now.getHours();
  let m = now.getMinutes();
  // round up to next 30-min slot
  if (m < 30) {
    m = 30;
  } else {
    m = 0;
    h = (h + 1) % 24;
  }
  for (let i = 0; i < 3; i++) {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    times.push(`${displayH}:${m === 0 ? "00" : "30"} ${period}`);
    m = m === 0 ? 30 : 0;
    if (m === 30 && i === 0) {
      // same hour
    } else if (m === 0) {
      h = (h + 1) % 24;
    }
    // advance by 30 min
    m = m === 30 ? 0 : 30;
    if (m === 0) h = (h + 1) % 24;
  }
  return times.slice(0, 3).join(", ");
}

function busInfo(from: string, to: string) {
  const busNumber = randInt(10, 99);
  const rideStops = randInt(3, 8);
  const rideMinutes = rideStops * randInt(3, 5);
  const walkToStop = randInt(3, 8);
  const walkFromStop = randInt(2, 5);
  const totalMinutes = walkToStop + rideMinutes + walkFromStop;

  const transitAreas = [
    "Central Station",
    "North Terminal",
    "City Junction",
    "East Market Square",
    "Harbour Front",
    "Heritage Quarter",
    "University Road",
    "Riverside Walk",
  ];
  const transitArea = pickRandom(transitAreas);

  return {
    busNumber,
    rideStops,
    rideMinutes,
    walkToStop,
    walkFromStop,
    totalMinutes,
    transitArea,
    departures: nextDepartures(),
    from,
    to,
  };
}

// ─── POI catalogue ────────────────────────────────────────────────────────────

const RESTAURANTS = [
  ["The Golden Spoon", "Saffron Garden", "Harbour Bites"],
  ["Mama Rosa's", "Street Flavours", "The Noodle Corner"],
  ["Spice Route", "Lakeside Grill", "Terra Kitchen"],
  ["The Urban Plate", "Café Bonanza", "The Hungry Wanderer"],
  ["Bazaar Bites", "Sunset Terrace", "Old Town Bistro"],
];

const SHOPS = [
  ["Heritage Craft Store", "Silk Road Boutique", "The Map Shop"],
  ["Artisan Alley", "The Local Market Co.", "Wanderer's Gear"],
  ["Souvenir Square", "The Textile House", "Palmetto Gifts"],
  ["City Bazaar", "The Book Nook", "Spice & Scent"],
  ["Nomad Supply Co.", "Pottery Lane", "The Trinket Store"],
];

const MARKETS = [
  ["Central Bazaar", "Old Quarter Night Market"],
  ["Waterfront Market", "Heritage Street Market"],
  ["The Grand Bazaar", "Dawn Market"],
  ["Folk Craft Market", "Evening Spice Market"],
];

function randomPois() {
  const restaurantSet = pickRandom(RESTAURANTS);
  const shopSet = pickRandom(SHOPS);
  const marketSet = pickRandom(MARKETS);
  return { restaurantSet, shopSet, marketSet };
}

// ─── Destination-specific info ────────────────────────────────────────────────

function destinationInfo(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("beach") || lower.includes("coast") || lower.includes("shore")) {
    return `🏖️ Best time to visit: Early morning (7–10 AM) or late afternoon (4–7 PM) to avoid peak heat.
  Bring sunscreen, water, and a hat. Lifeguards are on duty from 8 AM – 6 PM.
  Beach equipment rental is available at the main entrance. Nearby changing rooms and showers are open 7 AM – 8 PM.`;
  }
  if (lower.includes("museum") || lower.includes("gallery") || lower.includes("exhibit")) {
    return `🏛️ Opening hours: Tue–Sun, 9 AM – 5 PM (last entry 4:30 PM). Closed Mondays.
  Current featured exhibit is running until end of the season.
  Student & senior discounts available. Audio guides available at reception for a small fee.`;
  }
  if (lower.includes("park") || lower.includes("garden") || lower.includes("reserve")) {
    return `🌳 Open daily: Sunrise to sunset. Free entry to main grounds.
  Weekend nature walks led by local guides depart at 9 AM from the main gate.
  Picnic areas and BBQ grills available — book in advance on weekends.`;
  }
  if (lower.includes("market") || lower.includes("bazaar") || lower.includes("bazaar")) {
    return `🛒 Open: Mon–Sat, 8 AM – 7 PM. Sunday 9 AM – 3 PM.
  Best deals in the morning. Bring cash — many stalls don't accept cards.
  Look out for the local spice section and handmade crafts near the south entrance.`;
  }
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("diner")) {
    return `🍽️ Typically open 11 AM – 10 PM. Reservations recommended on weekends.
  Most restaurants offer set lunch menus from 12–2 PM at reduced rates.
  Local specialties are highly recommended — ask the staff for the dish of the day.`;
  }
  if (lower.includes("hotel") || lower.includes("resort") || lower.includes("inn")) {
    return `🏨 Check-in usually from 2 PM, check-out by 11 AM. Early check-in subject to availability.
  The hotel concierge can arrange local tours and transport.
  Amenities typically include restaurant, pool, and business centre.`;
  }
  if (lower.includes("landmark") || lower.includes("monument") || lower.includes("tower")) {
    return `🗼 Open daily, typically 9 AM – 6 PM (extended hours in summer).
  Guided tours available at 10 AM and 2 PM.
  Photography permitted in most areas — check signs for restricted zones.`;
  }
  return `📍 Typically open to visitors during daylight hours.
  Check locally for current events or seasonal activities.
  It's recommended to arrive early, especially on weekends and public holidays.`;
}

// ─── Full travel response builder ────────────────────────────────────────────

function buildTravelResponse(from: string, to: string): string {
  const info = busInfo(from, to);
  const { restaurantSet, shopSet, marketSet } = randomPois();

  return `Great! Here's how to get from **${from}** to **${to}**:

🗺️ DIRECTIONS
1. Start from ${from} heading towards the main road
2. Walk ~${info.walkToStop} minutes to the nearest bus stop
3. Board **Bus ${info.busNumber}** towards ${info.transitArea}
   ↳ Runs every 30 minutes
   ↳ Next departures: ${info.departures}
4. Ride for ~${info.rideStops} stops (about ${info.rideMinutes} min)
5. Alight at "${to} Stop" and walk ~${info.walkFromStop} min to your destination

⏱️ TOTAL TRAVEL TIME: ~${info.totalMinutes} minutes

🍽️ RESTAURANTS ON THE WAY
${restaurantSet.map((r) => `• ${r}`).join("\n")}

🛍️ SHOPS NEARBY
${shopSet.map((s) => `• ${s}`).join("\n")}

🚻 WASHROOMS
• Main bus terminal at ${info.transitArea}
• At the entrance of ${to}
• ${pickRandom(shopSet)} shopping area

🛒 MARKETS
${marketSet.map((m) => `• ${m}`).join("\n")}

📌 AT YOUR DESTINATION (${to})
${destinationInfo(to)}

Safe travels! 🌍 Ask me anything else about your trip.`;
}

// ─── Dantewada knowledge base ────────────────────────────────────────────────

const DANTEWADA_PLACES: Record<string, string> = {
  "dantewada": `📍 Dantewada is the district headquarters of Dantewada district in Chhattisgarh, India.\n\n🏛️ Key attractions:\n• Danteshwari Temple — Famous Shakti Peeth, one of 52 Shakti Peethas in India\n• Ecomuseum — showcases tribal culture and crafts\n• Weekly markets with local tribal handicrafts\n\n🚌 How to reach:\n• From Raipur: Take NH30, ~480 km, ~9 hours by road or bus\n• From Jagdalpur: ~80 km on NH30, ~2 hours by bus or taxi\n• Nearest railway station: Kirandul (NMDC rail line)\n• Daily bus services from Jagdalpur bus stand\n\n🕐 Best time to visit: October to March (cool weather)\n📞 STD Code: 07856`,

  "danteshwari temple": `🛕 Danteshwari Temple is one of the 52 Shakti Peethas and the most sacred temple in Bastar region.\n\n📍 Location: Central Dantewada town\n🕐 Timings: 6:00 AM – 1:00 PM and 3:00 PM – 8:00 PM\n📅 Main festival: Navratri (huge celebration, October)\n\n🚌 How to reach:\n• From Dantewada bus stand: 10-minute walk or auto-rickshaw\n• From Jagdalpur: 80 km via NH30, buses available\n• From Raipur: ~480 km, overnight bus available\n\n💡 Tips:\n• Remove footwear before entering\n• Photography may be restricted in inner sanctum\n• Very crowded during Navratri — plan accordingly`,

  "geedam": `📍 Geedam is a town in Dantewada district known for its weekly market and as a transport hub.\n\n🚌 How to reach from Dantewada:\n• Distance: ~40 km north of Dantewada\n• Bus: Regular buses from Dantewada bus stand, ~1 hour\n• Auto-rickshaw/taxi also available\n\n🛍️ Local attractions:\n• Weekly market (haat bazaar) — local produce, handicrafts, tribal goods\n• Gateway to surrounding villages\n\n🕐 Best time: Any season, weekday market days most vibrant`,

  "barsur": `🏛️ Barsur is an ancient historic town famous for its 12th-century temples and sculptures.\n\n📍 Location: South of Dantewada, ~25 km\n\n🏛️ Must-see:\n• Mamda Devi Temple — ancient Shiva complex\n• Chandradittya Temple with intricate carvings\n• Large Ganesh statues (9th–12th century)\n\n🚌 How to reach:\n• From Dantewada: ~25 km south, auto/jeep/taxi\n• Buses via Aranpur route, 45 min–1 hour\n\n🕐 Best time to visit: 9 AM – 5 PM daily`,

  "kirandul": `🏭 Kirandul is an industrial town home to NMDC's Bailadila Iron Ore Project, one of India's largest.\n\n📍 Location: ~130 km south of Dantewada\n\n🚌 How to reach:\n• From Dantewada: ~2.5 hours by road\n• Rail: Kirandul has a railway station on the Kirandul–Visakhapatnam line\n• Trains from Visakhapatnam: Kirandul Express\n\n🏭 Attractions:\n• Bailadila Iron Ore Mines (permission required for visit)\n• Bailadila Hills trekking\n• Indravati River views`,

  "bailadila": `⛰️ Bailadila (meaning "Bullocks' Hump") is a range of hills rich in iron ore, a major mining region.\n\n📍 Location: Near Kirandul, ~130 km south of Dantewada\n\n⛏️ Known for:\n• Bailadila Iron Ore Mine — one of the largest in India\n• Scenic Bailadila Hills for trekking\n• NMDC operations\n\n🚌 How to reach from Dantewada:\n• Road: ~130 km south, ~2.5–3 hours by car/bus\n• Rail: Kirandul Railway Station`,

  "jagdalpur": `🏙️ Jagdalpur is the headquarters of Bastar district and major city near Dantewada.\n\n📍 Distance from Dantewada: ~80 km north on NH30\n\n🏛️ Must visit:\n• Chitrakoot Waterfall — India's widest waterfall (~38 km from Jagdalpur)\n• Bastar Palace\n• Kailash Cave\n• Tirathgarh Waterfall\n• Bastar Dussehra (world's longest festival!)\n\n🚌 How to reach:\n• From Dantewada: Regular bus (NH30), ~2 hours\n• From Raipur: ~300 km, ~6 hours by road\n• Nearest airport: Jagdalpur Airport (JAI) — flights to Raipur\n\n🕐 Best time: October–March`,

  "pharasgaon": `🏘️ Pharasgaon is a small town north of Dantewada.\n🚌 Reach from Dantewada: Regular buses via Geedam, ~1–1.5 hours\n🛍️ Local weekly market, traditional Gondi culture, local produce`,

  "chitalnar": `🏘️ Chitalnar is a village in Dantewada district known for traditional tribal way of life.\n🚌 Reach from Dantewada: ~20–30 km, auto/jeep/taxi\n🌿 Experience: Rural Chhattisgarhi village life, local food, nature`,

  "bacheli": `🏘️ Bacheli is a township near Kirandul, home to NMDC workers.\n🚌 Reach from Dantewada: ~120 km south by road\n🏭 Connected to Bailadila iron ore project`,

  "katekalyan": `🏘️ Katekalyan is a block headquarters in Dantewada district.\n🚌 Reach from Dantewada: ~40 km, local buses available\n🌄 Gateway to forested areas and tribal villages`,

  "indravati": `🐯 Indravati National Park and Tiger Reserve is one of India's pristine tiger reserves.\n\n📍 Location: Western Dantewada / Bijapur district border\n\n🦁 Wildlife:\n• Bengal tigers, leopards\n• Wild buffalo (rare)\n• Gaur, deer, wild boar\n• Rich birdlife\n\n🚌 How to reach:\n• From Dantewada: ~80–100 km west, private vehicle recommended\n• Nearest town: Bhopalpatnam\n\n📅 Season: October–June (closed July–September monsoon)\n⚠️ Entry permit required from Forest Department`,

  "chitrakoot": `💧 Chitrakoot Waterfall is called "India's Niagara Falls" — the widest waterfall in India.\n\n📍 Location: ~38 km west of Jagdalpur (Bastar), ~120 km from Dantewada\n\n🌊 Best time: July–October (peak flow during monsoon)\n🕐 Open: Sunrise to sunset\n\n🚌 How to reach from Dantewada:\n• Bus to Jagdalpur (2 hrs) then local bus/taxi to Chitrakoot (~1 hr)\n• Total: ~3–4 hours journey\n\n💡 Tips:\n• Boat rides available at base\n• Very crowded on weekends and holidays`,
};

// ─── Rule-based response engine ───────────────────────────────────────────────

function parseLocations(text: string): { from: string | null; to: string | null } {
  const t = text.toLowerCase().trim();

  // Pattern: "from X to Y" or "X to Y"
  const fromTo =
    t.match(/from\s+(.+?)\s+to\s+(.+)/i) ||
    t.match(/\bat\s+(.+?)\s+(?:and\s+)?(?:want\s+to\s+go|going)\s+to\s+(.+)/i) ||
    t.match(/i(?:'m|\s+am)\s+(?:at|in)\s+(.+?)\s+(?:and\s+)?(?:want\s+to\s+go|going)\s+to\s+(.+)/i) ||
    t.match(/(.+?)\s+to\s+(.+)/);

  if (fromTo) {
    return {
      from: fromTo[1].trim().replace(/[?.!,]+$/, ""),
      to: fromTo[2].trim().replace(/[?.!,]+$/, ""),
    };
  }
  return { from: null, to: null };
}

function generateBotResponse(
  userText: string,
  context: TravelContext
): { text: string; newContext: TravelContext } {
  const t = userText.toLowerCase().trim();
  let newContext = { ...context };

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|howdy|good\s+morning|good\s+afternoon|good\s+evening|yo)\b/.test(t)) {
    return {
      text: `Hello! 👋 Welcome to **WanderGuide AI** — your personal travel assistant!

I can help you:
• Get step-by-step directions to any destination
• Find the right bus and departure times
• Discover restaurants, shops & markets along the way
• Learn about your destination

Just tell me where you are and where you'd like to go.
For example: *"I am at City Center and want to go to the Beach"*`,
      newContext,
    };
  }

  // ── Dantewada-specific lookup ─────────────────────────────────────────────
  const dantewadaKeys = Object.keys(DANTEWADA_PLACES);
  const matchedPlace = dantewadaKeys.find(key => t.includes(key));
  if (matchedPlace && !/from|to|how.*get|direction|route/.test(t)) {
    return { text: DANTEWADA_PLACES[matchedPlace], newContext };
  }

  // ── Dantewada district overview ───────────────────────────────────────────
  if (/dantewada.*district|about.*dantewada|what.*dantewada|tell.*dantewada|villages.*dantewada|cities.*dantewada|towns.*dantewada/.test(t)) {
    return {
      text: `🗺️ **Dantewada District — Complete Guide**\n\n📍 **Cities & Towns:**\n• Dantewada (District HQ)\n• Geedam\n• Katekalyan\n• Kuakonda\n• Barsur\n• Bacheli\n• Kirandul\n\n🏘️ **Villages:**\n• Pharasgaon, Chitalnar, Tongpal, Haldi\n• Darbha, Makdi, Nakulnar, Dornapal\n• Kistaram, Bhairamgarh, Aranpur\n• Hiroli, Pamed, Bhopalpatnam\n\n🛕 **Famous Landmarks:**\n• Danteshwari Temple (Shakti Peeth)\n• Barsur Ancient Temples\n• Bailadila Iron Ore Mine\n• Indravati National Park\n\n🚌 **How to reach Dantewada:**\n• From Raipur: ~480 km via NH30, ~9 hrs\n• From Jagdalpur: ~80 km, ~2 hrs bus\n• Train: Kirandul–Visakhapatnam line\n\nAsk me about any specific place for detailed directions!`,
      newContext,
    };
  }

  // ── Help ──────────────────────────────────────────────────────────────────
  if (/\bhelp\b/.test(t)) {
    return {
      text: `🤖 **How to use WanderGuide AI**

Tell me your starting point and destination in any of these ways:
• *"From Central Station to Heritage Museum"*
• *"I'm at the hotel and want to go to the beach"*
• *"City Park to Grand Bazaar"*

I'll give you:
✅ Step-by-step bus directions
✅ Live departure times
✅ Restaurants & shops on the route
✅ Washrooms & markets
✅ What to expect at your destination`,
      newContext,
    };
  }

  // ── Time / duration follow-up ─────────────────────────────────────────────
  if (/how long|travel time|duration|how much time/.test(t)) {
    if (context.from && context.to) {
      const mins = randInt(20, 65);
      return {
        text: `⏱️ The journey from **${context.from}** to **${context.to}** takes approximately **${mins} minutes** in total, including walking time to the bus stop and from the drop-off point.`,
        newContext,
      };
    }
    return {
      text: `To estimate travel time, I'll need your starting point and destination. Please tell me where you are and where you're headed!`,
      newContext,
    };
  }

  // ── Bus follow-up ─────────────────────────────────────────────────────────
  if (/which bus|what bus|bus number|bus route|bus schedule/.test(t)) {
    if (context.from && context.to) {
      const num = randInt(10, 99);
      const deps = nextDepartures();
      return {
        text: `🚌 **Bus ${num}** runs between **${context.from}** and **${context.to}**.
Next departures: **${deps}**
Frequency: Every 30 minutes.
Tip: Validate your ticket before boarding.`,
        newContext,
      };
    }
    return {
      text: `Please share your starting location and destination so I can find the right bus for you!`,
      newContext,
    };
  }

  // ── Restaurant follow-up ──────────────────────────────────────────────────
  if (/restaurant|food|eat|dining|cafe|lunch|dinner|breakfast/.test(t)) {
    const set = pickRandom(RESTAURANTS);
    const area = context.to ?? "the area";
    return {
      text: `🍽️ **Restaurants near ${area}**:
• ${set[0]} — local favourites, open 11 AM – 10 PM
• ${set[1]} — great for a quick bite, outdoor seating available
• ${set[2]} — popular with tourists, set menus available

Most open until late evening. Reservations recommended on weekends!`,
      newContext,
    };
  }

  // ── Safety ────────────────────────────────────────────────────────────────
  if (/safe|safety|secure|danger/.test(t)) {
    return {
      text: `🛡️ **Safety Tips for Tourists**

• Keep your belongings secure in crowded areas
• Use official taxi services or rideshare apps
• Keep a copy of your ID separate from the original
• Stay on well-lit streets at night
• Share your itinerary with someone you trust
• Save the local emergency number: 112 (international standard)
• Visit the local tourist information centre for area-specific advice`,
      newContext,
    };
  }

  // ── Opening times ─────────────────────────────────────────────────────────
  if (/open|hours|what time|opening|close|closing/.test(t)) {
    const dest = context.to ?? "most tourist attractions";
    return {
      text: `🕐 **General opening hours for ${dest}**:
${destinationInfo(context.to ?? "")}

For the most accurate timings, I recommend checking the official website or calling ahead — especially on public holidays!`,
      newContext,
    };
  }

  // ── Shops/markets ─────────────────────────────────────────────────────────
  if (/shop|market|buy|purchase|souvenir|mall|bazaar/.test(t)) {
    const shops = pickRandom(SHOPS);
    const markets = pickRandom(MARKETS);
    return {
      text: `🛍️ **Shops & Markets nearby**:

Shops:
• ${shops[0]}
• ${shops[1]}
• ${shops[2]}

Markets:
• ${markets[0]} — open mornings, great for local produce
• ${markets[1]} — evening market, handmade crafts & souvenirs

Tip: Bargaining is welcomed at the market stalls!`,
      newContext,
    };
  }

  // ── Try to extract travel intent ─────────────────────────────────────────
  const { from, to } = parseLocations(userText);

  if (from && to) {
    newContext = { from, to };
    return {
      text: buildTravelResponse(from, to),
      newContext,
    };
  }

  // User gave only destination (no "from")
  if (to && !from) {
    newContext = { ...context, to };
    if (context.from) {
      return {
        text: buildTravelResponse(context.from, to),
        newContext: { from: context.from, to },
      };
    }
    return {
      text: `Got it — you want to visit **${to}**! 📍

Where are you starting from? Just tell me your current location or landmark and I'll map out the full route for you.`,
      newContext,
    };
  }

  // User might be giving a starting point only
  if (from && !to) {
    newContext = { ...context, from };
    return {
      text: `Got it — you're starting from **${from}**. 🚩

Where would you like to go? Tell me your destination and I'll plan the route!`,
      newContext,
    };
  }

  // Might just be a location name
  const possibleLocation = userText.trim();
  if (possibleLocation.length > 2 && possibleLocation.length < 50) {
    if (!context.from) {
      newContext = { ...context, from: possibleLocation };
      return {
        text: `I'll note that as your starting point: **${possibleLocation}**.

Now where would you like to go? Tell me your destination!`,
        newContext,
      };
    }
    if (!context.to) {
      newContext = { ...context, to: possibleLocation };
      return {
        text: buildTravelResponse(context.from, possibleLocation),
        newContext,
      };
    }
  }

  // Fallback
  return {
    text: `I'd love to help you navigate! 🗺️

Please tell me:
• Where you **currently are** (starting point)
• Where you **want to go** (destination)

Example: *"I'm at Central Station and want to go to the Old Museum"*`,
    newContext,
  };
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isBot = message.role === "bot";
  // Render markdown-lite: bold via **text**
  const renderText = (text: string) => {
    const lines = text.split("\n");
    const result: React.ReactNode[] = [];
    for (const [lineStr, line] of lines.entries()) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const nodes: React.ReactNode[] = [];
      for (const [partStr, part] of parts.entries()) {
        if (partStr % 2 === 1) {
          nodes.push(<strong key={`${lineStr}-bold-${part.slice(0, 8)}`} className="font-semibold">{part}</strong>);
        } else {
          nodes.push(<span key={`${lineStr}-text-${part.slice(0, 8)}`}>{part}</span>);
        }
      }
      result.push(<span key={`line-${lineStr}-${line.slice(0, 8)}`} className="block">{nodes}</span>);
    }
    return result;
  };

  return (
    <div className={cn("flex gap-2 mb-3", isBot ? "items-start" : "items-end flex-row-reverse")}>
      {isBot && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn("max-w-[80%] flex flex-col", isBot ? "items-start" : "items-end")}>
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
            isBot
              ? "bg-emerald-50 text-slate-800 rounded-tl-sm border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-50 dark:border-emerald-900"
              : "bg-emerald-600 text-white rounded-br-sm"
          )}
        >
          {renderText(message.text)}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "bot",
  text: `Hello! 👋 I'm your **WanderGuide AI** for **Dantewada District**, Chhattisgarh.\n\nI can help you:\n• Find cities, towns and villages in Dantewada district\n• Get directions to temples, waterfalls, and landmarks\n• Discover local restaurants and stay options\n• Plan your route with bus timings\n\nTry asking:\n• *"Tell me about Danteshwari Temple"*\n• *"How to reach Kirandul from Dantewada?"*\n• *"Villages in Dantewada district"*`,
  timestamp: new Date(),
};

export function TravelChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [travelContext, setTravelContext] = useState<TravelContext>({ from: null, to: null });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom (no dep array needed – always scroll after render)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleClear = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
    setTravelContext({ from: null, to: null });
  }, []);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: uid(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot "thinking" delay
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const { text: botText, newContext } = generateBotResponse(text, travelContext);
      setTravelContext(newContext);
      const botMessage: Message = {
        id: uid(),
        role: "bot",
        text: botText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, delay);
  }, [inputValue, travelContext]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const quickSuggestions = [
    "How to reach Danteshwari Temple?",
    "Villages near Dantewada",
    "Restaurants in Dantewada",
    "Help",
  ];

  return (
    <>
      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-[60] flex flex-col bg-background border border-border rounded-2xl shadow-2xl",
            "bottom-24 left-4",
            "w-[calc(100vw-2rem)] sm:w-[380px]",
            "max-h-[calc(100vh-8rem)] sm:max-h-[520px]",
            "animate-in slide-in-from-bottom-4 fade-in duration-200"
          )}
          role="dialog"
          aria-label="WanderGuide AI Travel Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-emerald-600 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">WanderGuide AI</p>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                  Travel Assistant Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Route context indicator */}
          {(travelContext.from || travelContext.to) && (
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 flex-wrap">
              <MapPin className="w-3 h-3 shrink-0" />
              {travelContext.from && (
                <span className="font-medium">{travelContext.from}</span>
              )}
              {travelContext.from && travelContext.to && (
                <span className="text-emerald-500">→</span>
              )}
              {travelContext.to && (
                <span className="font-medium">{travelContext.to}</span>
              )}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
            <div className="px-3 py-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex items-start gap-2 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Quick suggestions */}
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setInputValue(suggestion);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex items-center gap-2 border-t border-border pt-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Where are you going?"
              className="flex-1 text-sm h-9 bg-secondary/50 border-border"
              disabled={isTyping}
              aria-label="Message input"
            />
            <Button
              type="button"
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="h-9 w-9 p-0 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 transition-colors disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "relative w-14 h-14 rounded-full shadow-modal bg-emerald-600 hover:bg-emerald-700 text-white",
            "flex items-center justify-center transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isOpen && "scale-95 bg-emerald-700"
          )}
          aria-label={isOpen ? "Close travel assistant" : "Open travel assistant"}
        >
          {/* Pulsing indicator */}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex">
              <span className="animate-ping absolute w-3 h-3 rounded-full bg-green-400 opacity-75" />
              <span className="relative w-3 h-3 rounded-full bg-green-400" />
            </span>
          )}
          <Bot className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
