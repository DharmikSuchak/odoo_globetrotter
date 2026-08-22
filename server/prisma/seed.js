const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

// ── City catalog ──────────────────────────────────────────────────────────────
// costIndex: 1 (very cheap) → 10 (very expensive)
const cities = [
  {
    name: "Paris",
    country: "France",
    countryCode: "FR",
    costIndex: 8.5,
    latitude: 48.8566,
    longitude: 2.3522,
    description: "The City of Light — iconic art, cuisine, and romance along the Seine.",
  },
  {
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    costIndex: 7.5,
    latitude: 35.6762,
    longitude: 139.6503,
    description: "Where ancient temples meet neon-lit skyscrapers in perfect harmony.",
  },
  {
    name: "New York",
    country: "United States",
    countryCode: "US",
    costIndex: 9.0,
    latitude: 40.7128,
    longitude: -74.006,
    description: "The city that never sleeps — museums, Broadway, and iconic skylines.",
  },
  {
    name: "Rome",
    country: "Italy",
    countryCode: "IT",
    costIndex: 6.5,
    latitude: 41.9028,
    longitude: 12.4964,
    description: "An open-air museum where millennia of history await every corner.",
  },
  {
    name: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    costIndex: 6.0,
    latitude: 41.3851,
    longitude: 2.1734,
    description: "Gaudí's masterpieces, golden beaches, and vibrant tapas culture.",
  },
  {
    name: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    costIndex: 3.5,
    latitude: 13.7563,
    longitude: 100.5018,
    description: "A sensory overload of golden temples, street food, and riverlife.",
  },
  {
    name: "Bali",
    country: "Indonesia",
    countryCode: "ID",
    costIndex: 3.0,
    latitude: -8.3405,
    longitude: 115.092,
    description: "Island of the gods — terraced rice fields, surf, and spiritual retreats.",
  },
  {
    name: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    costIndex: 4.5,
    latitude: -33.9249,
    longitude: 18.4241,
    description: "Dramatic mountains, world-class wines, and two oceans meeting.",
  },
  {
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    costIndex: 8.0,
    latitude: -33.8688,
    longitude: 151.2093,
    description: "Iconic harbour, golden beaches, and a thriving cosmopolitan culture.",
  },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    costIndex: 8.0,
    latitude: 25.2048,
    longitude: 55.2708,
    description: "Futuristic skyline, luxury shopping, and desert adventures.",
  },
  {
    name: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    costIndex: 5.5,
    latitude: 38.7169,
    longitude: -9.1395,
    description: "Pastel-hued hilltop city with Fado music, trams, and great seafood.",
  },
  {
    name: "Prague",
    country: "Czech Republic",
    countryCode: "CZ",
    costIndex: 4.0,
    latitude: 50.0755,
    longitude: 14.4378,
    description: "A fairy-tale medieval city with a lively nightlife and craft beer scene.",
  },
  {
    name: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    costIndex: 3.5,
    latitude: 19.4326,
    longitude: -99.1332,
    description: "Aztec history, world-class museums, and one of the best food scenes on Earth.",
  },
  {
    name: "Kyoto",
    country: "Japan",
    countryCode: "JP",
    costIndex: 6.5,
    latitude: 35.0116,
    longitude: 135.7681,
    description: "Japan's cultural soul — geisha districts, bamboo groves, and zen gardens.",
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    costIndex: 7.5,
    latitude: 52.3676,
    longitude: 4.9041,
    description: "Canal-laced city of world-class museums, cycling culture, and freedom.",
  },
  {
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    costIndex: 8.5,
    latitude: 1.3521,
    longitude: 103.8198,
    description: "A gleaming city-state where hawker centres meet futuristic Gardens by the Bay.",
  },
  {
    name: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    costIndex: 4.5,
    latitude: 41.0082,
    longitude: 28.9784,
    description: "Where East meets West — mosques, bazaars, and the Bosphorus strait.",
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    countryCode: "AR",
    costIndex: 3.0,
    latitude: -34.6037,
    longitude: -58.3816,
    description: "The Paris of South America — tango, steak, and passionate football culture.",
  },
];

// ── Activity catalog ──────────────────────────────────────────────────────────
// stopId is null — these are catalog/template activities, not tied to any trip
const activities = [
  // PARIS — Sightseeing
  {
    cityName: "Paris",
    name: "Eiffel Tower Visit",
    category: "SIGHTSEEING",
    cost: 25,
    durationHours: 2,
    description: "Climb the iconic iron lattice tower for panoramic views of Paris.",
  },
  {
    cityName: "Paris",
    name: "Louvre Museum Tour",
    category: "CULTURE",
    cost: 17,
    durationHours: 4,
    description: "Explore the world's largest art museum, home to the Mona Lisa.",
  },
  {
    cityName: "Paris",
    name: "Montmartre & Sacré-Cœur Walk",
    category: "SIGHTSEEING",
    cost: 0,
    durationHours: 3,
    description: "Stroll the bohemian hilltop neighbourhood and visit the stunning basilica.",
  },
  {
    cityName: "Paris",
    name: "French Patisserie Tour",
    category: "FOOD",
    cost: 40,
    durationHours: 2.5,
    description: "Guided tasting tour through Paris's finest bakeries — croissants, éclairs, macarons.",
  },

  // TOKYO — Mixed
  {
    cityName: "Tokyo",
    name: "Shibuya Crossing & Harajuku",
    category: "SIGHTSEEING",
    cost: 0,
    durationHours: 3,
    description: "Experience the world's busiest pedestrian crossing and Japan's pop culture street.",
  },
  {
    cityName: "Tokyo",
    name: "Ramen Tasting Experience",
    category: "FOOD",
    cost: 30,
    durationHours: 2,
    description: "Sample three regional ramen styles at famous spots in Shinjuku.",
  },
  {
    cityName: "Tokyo",
    name: "teamLab Borderless Digital Art",
    category: "CULTURE",
    cost: 32,
    durationHours: 3,
    description: "Immersive digital art museum where exhibits blend into each other.",
  },
  {
    cityName: "Tokyo",
    name: "Mount Fuji Day Trip",
    category: "ADVENTURE",
    cost: 80,
    durationHours: 10,
    description: "Day excursion to climb or view the iconic volcano from Hakone.",
  },

  // NEW YORK — Mixed
  {
    cityName: "New York",
    name: "Central Park Bike Tour",
    category: "ADVENTURE",
    cost: 35,
    durationHours: 3,
    description: "Cycle through 843 acres of NYC's iconic urban greenspace.",
  },
  {
    cityName: "New York",
    name: "Broadway Show",
    category: "CULTURE",
    cost: 150,
    durationHours: 2.5,
    description: "Experience a live performance in the entertainment capital of the world.",
  },
  {
    cityName: "New York",
    name: "Brooklyn Food Market",
    category: "FOOD",
    cost: 25,
    durationHours: 2,
    description: "Sample artisan foods at Smorgasburg — New York's premier outdoor food market.",
  },

  // ROME — Sightseeing + Food
  {
    cityName: "Rome",
    name: "Colosseum & Roman Forum",
    category: "SIGHTSEEING",
    cost: 16,
    durationHours: 3,
    description: "Walk through 2,000 years of history at Rome's ancient amphitheatre.",
  },
  {
    cityName: "Rome",
    name: "Vatican Museums & Sistine Chapel",
    category: "CULTURE",
    cost: 20,
    durationHours: 4,
    description: "Marvel at Michelangelo's ceiling in the pope's private chapel.",
  },
  {
    cityName: "Rome",
    name: "Trastevere Food Walk",
    category: "FOOD",
    cost: 55,
    durationHours: 3,
    description: "Guided evening food tour through Rome's most atmospheric neighbourhood.",
  },

  // BARCELONA
  {
    cityName: "Barcelona",
    name: "Sagrada Família Tour",
    category: "SIGHTSEEING",
    cost: 26,
    durationHours: 2.5,
    description: "Visit Gaudí's unfinished masterpiece — Barcelona's most visited landmark.",
  },
  {
    cityName: "Barcelona",
    name: "Tapas & Wine Crawl",
    category: "FOOD",
    cost: 60,
    durationHours: 3,
    description: "Evening crawl through El Born's best tapas bars with local wine pairings.",
  },
  {
    cityName: "Barcelona",
    name: "Park Güell Sunrise Visit",
    category: "SIGHTSEEING",
    cost: 10,
    durationHours: 2,
    description: "Watch the sunrise over the city from Gaudí's colourful hillside park.",
  },

  // BANGKOK — Budget + Culture
  {
    cityName: "Bangkok",
    name: "Grand Palace & Wat Phra Kaew",
    category: "SIGHTSEEING",
    cost: 15,
    durationHours: 3,
    description: "Visit Thailand's most sacred temple complex inside the Grand Palace grounds.",
  },
  {
    cityName: "Bangkok",
    name: "Street Food Night Tour",
    category: "FOOD",
    cost: 20,
    durationHours: 2.5,
    description: "Guided tour through Chinatown's legendary Yaowarat Road food stalls.",
  },
  {
    cityName: "Bangkok",
    name: "Muay Thai Boxing Match",
    category: "ADVENTURE",
    cost: 30,
    durationHours: 3,
    description: "Watch an electrifying Muay Thai bout at the legendary Rajadamnern Stadium.",
  },

  // BALI — Adventure + Relaxation
  {
    cityName: "Bali",
    name: "Surf Lessons at Kuta Beach",
    category: "ADVENTURE",
    cost: 25,
    durationHours: 2,
    description: "Learn to ride waves with expert instructors on Bali's famous surf beach.",
  },
  {
    cityName: "Bali",
    name: "Tegallalang Rice Terrace Trek",
    category: "ADVENTURE",
    cost: 10,
    durationHours: 3,
    description: "Walk through Ubud's stunning UNESCO-listed rice terraces.",
  },
  {
    cityName: "Bali",
    name: "Traditional Balinese Spa",
    category: "RELAXATION",
    cost: 35,
    durationHours: 2,
    description: "Indulge in a full-body Balinese massage and flower petal bath ritual.",
  },

  // CAPE TOWN — Adventure
  {
    cityName: "Cape Town",
    name: "Table Mountain Cable Car",
    category: "ADVENTURE",
    cost: 30,
    durationHours: 3,
    description: "Ride to the top of Table Mountain for 360° views of Cape Town and two oceans.",
  },
  {
    cityName: "Cape Town",
    name: "Cape Winelands Tour",
    category: "RELAXATION",
    cost: 75,
    durationHours: 6,
    description: "Full-day tour of Stellenbosch and Franschhoek's world-class wine estates.",
  },

  // SYDNEY
  {
    cityName: "Sydney",
    name: "Sydney Opera House Tour",
    category: "CULTURE",
    cost: 40,
    durationHours: 1.5,
    description: "Behind-the-scenes tour of the world's most recognisable performing arts venue.",
  },
  {
    cityName: "Sydney",
    name: "Bondi to Coogee Coastal Walk",
    category: "ADVENTURE",
    cost: 0,
    durationHours: 3,
    description: "Stunning 6km clifftop walk along Sydney's world-famous coastal scenery.",
  },

  // KYOTO — Culture + Relaxation
  {
    cityName: "Kyoto",
    name: "Fushimi Inari Shrine Hike",
    category: "SIGHTSEEING",
    cost: 0,
    durationHours: 3,
    description: "Hike through thousands of vermillion torii gates on the sacred Inari mountain.",
  },
  {
    cityName: "Kyoto",
    name: "Traditional Tea Ceremony",
    category: "CULTURE",
    cost: 35,
    durationHours: 1.5,
    description: "Participate in an authentic matcha tea ceremony in a historic machiya townhouse.",
  },
  {
    cityName: "Kyoto",
    name: "Onsen Ryokan Experience",
    category: "RELAXATION",
    cost: 120,
    durationHours: 12,
    description: "Overnight stay at a traditional inn with private hot spring and kaiseki dinner.",
  },
  {
    cityName: "Kyoto",
    name: "Arashiyama Bamboo Grove",
    category: "SIGHTSEEING",
    cost: 0,
    durationHours: 2,
    description: "Walk through the ethereal bamboo forest and visit Tenryu-ji zen garden.",
  },

  // AMSTERDAM
  {
    cityName: "Amsterdam",
    name: "Canal Boat Tour",
    category: "SIGHTSEEING",
    cost: 20,
    durationHours: 1.5,
    description: "Glide through Amsterdam's UNESCO-listed canal ring on a guided boat.",
  },
  {
    cityName: "Amsterdam",
    name: "Rijksmuseum Visit",
    category: "CULTURE",
    cost: 22,
    durationHours: 3,
    description: "Explore Rembrandt, Vermeer, and 8,000 years of Dutch art and history.",
  },

  // ISTANBUL
  {
    cityName: "Istanbul",
    name: "Hagia Sophia & Blue Mosque",
    category: "SIGHTSEEING",
    cost: 15,
    durationHours: 3,
    description: "Visit two of the world's most breathtaking religious monuments side by side.",
  },
  {
    cityName: "Istanbul",
    name: "Grand Bazaar Shopping",
    category: "SHOPPING",
    cost: 5,
    durationHours: 2.5,
    description: "Navigate 4,000 shops selling spices, textiles, jewellery, and ceramics.",
  },
  {
    cityName: "Istanbul",
    name: "Bosphorus Sunset Cruise",
    category: "RELAXATION",
    cost: 25,
    durationHours: 2,
    description: "Sail between Europe and Asia as the sun sets over Istanbul's skyline.",
  },

  // PRAGUE
  {
    cityName: "Prague",
    name: "Prague Castle & Old Town Walk",
    category: "SIGHTSEEING",
    cost: 12,
    durationHours: 4,
    description: "Explore the world's largest ancient castle complex and the astronomical clock.",
  },
  {
    cityName: "Prague",
    name: "Czech Craft Beer Pub Crawl",
    category: "NIGHTLIFE",
    cost: 35,
    durationHours: 3,
    description: "Sample Czech pilsners and dark lagers at Prague's legendary underground pubs.",
  },

  // MEXICO CITY
  {
    cityName: "Mexico City",
    name: "Teotihuacan Pyramids",
    category: "SIGHTSEEING",
    cost: 20,
    durationHours: 6,
    description: "Climb the Pyramid of the Sun at the ancient city of the gods, 50km from CDMX.",
  },
  {
    cityName: "Mexico City",
    name: "Street Taco Tour",
    category: "FOOD",
    cost: 18,
    durationHours: 2.5,
    description: "Sample al pastor, barbacoa, and tlayudas at legendary CDMX taco stands.",
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 0. Seed admin account ──────────────────────────────────────────────────
  const ADMIN_EMAIL    = "admin@globetrotter.dev";
  const ADMIN_PASSWORD = "GlobeTrotter@2026!";
  const ADMIN_NAME     = "Admin";

  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN" }, // Ensure role stays ADMIN even on re-seed
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });

  console.log("👤 Admin account ready:");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Role:     ADMIN\n`);

  // 1. Upsert cities
  console.log(`📍 Seeding ${cities.length} cities...`);
  const cityMap = {}; // name → id

  for (const city of cities) {
    const created = await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: { costIndex: city.costIndex, latitude: city.latitude, longitude: city.longitude, description: city.description },
      create: city,
    });
    cityMap[city.name] = created.id;
    process.stdout.write(`   ✓ ${city.name}, ${city.country} (costIndex: ${city.costIndex})\n`);
  }

  // 2. Seed catalog activities (no stopId)
  console.log(`\n🎯 Seeding ${activities.length} catalog activities...`);

  for (const act of activities) {
    const existing = await prisma.activity.findFirst({
      where: { name: act.name, stopId: null }
    });
    
    if (existing) {
      await prisma.activity.update({
        where: { id: existing.id },
        data: {
          ...act,
          stopId: null
        }
      });
    } else {
      await prisma.activity.create({
        data: {
          ...act,
          stopId: null
        },
      });
    }
    process.stdout.write(`   ✓ [${act.category.padEnd(12)}] ${act.name} (${act.cityName})\n`);
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Cities: ${cities.length}`);
  console.log(`   Activities: ${activities.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
