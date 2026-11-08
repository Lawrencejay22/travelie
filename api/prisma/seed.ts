import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'beach', name: 'Beach' },
  { slug: 'island', name: 'Island' },
  { slug: 'mountain', name: 'Mountain' },
  { slug: 'heritage', name: 'Heritage' },
  { slug: 'city', name: 'City' },
  { slug: 'adventure', name: 'Adventure' },
  { slug: 'nature', name: 'Nature' },
];

const cities = [
  { slug: 'malay', name: 'Malay, Aklan', latitude: 11.9219, longitude: 121.9495 },
  { slug: 'el-nido', name: 'El Nido, Palawan', latitude: 11.1961, longitude: 119.3965 },
  { slug: 'banaue', name: 'Banaue, Ifugao', latitude: 16.9122, longitude: 121.0616 },
  { slug: 'carmen', name: 'Carmen, Bohol', latitude: 9.8236, longitude: 124.1581 },
  { slug: 'badian', name: 'Badian, Cebu', latitude: 9.8694, longitude: 123.3664 },
  { slug: 'general-luna', name: 'General Luna, Surigao del Norte', latitude: 9.8006, longitude: 126.1589 },
  { slug: 'manila', name: 'Manila', latitude: 14.5995, longitude: 120.9842 },
  { slug: 'legazpi', name: 'Legazpi, Albay', latitude: 13.1391, longitude: 123.7438 },
  { slug: 'vigan', name: 'Vigan, Ilocos Sur', latitude: 17.5747, longitude: 120.3869 },
];

interface SeedDestination {
  slug: string;
  name: string;
  city: string;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours: string;
  entranceFee: number | null;
  isFeatured: boolean;
  categories: string[];
}

const destinations: SeedDestination[] = [
  {
    slug: 'white-beach-boracay',
    name: 'White Beach, Boracay',
    city: 'malay',
    summary: 'Powder-fine sand and legendary sunsets on the island that put Philippine beaches on the map.',
    description:
      'Stretching across four kilometers of Boracay’s western coast, White Beach is divided into three stations that each carry a different rhythm. Station 1 is quiet and upscale, Station 2 hums with beachfront dining, and Station 3 keeps things laid-back and local. Come late afternoon, the whole shoreline turns gold as paraw sailboats cut across the sunset.',
    latitude: 11.9637406,
    longitude: 121.9205,
    address: 'Station 2, White Beach, Boracay, Malay, Aklan',
    openingHours: 'Open 24 hours',
    entranceFee: 0,
    isFeatured: true,
    categories: ['beach', 'island'],
  },
  {
    slug: 'el-nido-big-lagoon',
    name: 'Big Lagoon, El Nido',
    city: 'el-nido',
    summary: 'Emerald water framed by limestone cliffs, best experienced by kayak at first light.',
    description:
      'The Big Lagoon is the centerpiece of El Nido’s Bacuit Archipelago: a sheltered lagoon where the water shifts from jade to deep teal as the sun climbs. Boat tours arrive mid-morning, so private charters and early kayak trips are rewarded with near silence. Bring reef-safe sunscreen and a dry bag for the short swims between lagoons.',
    latitude: 11.1547427,
    longitude: 119.3208731,
    address: 'Bacuit Archipelago, El Nido, Palawan',
    openingHours: '6:00 AM – 5:00 PM (day tours)',
    entranceFee: 400,
    isFeatured: true,
    categories: ['beach', 'adventure', 'nature'],
  },
  {
    slug: 'banaue-rice-terraces',
    name: 'Banaue Rice Terraces',
    city: 'banaue',
    summary: 'Two thousand years of Ifugao engineering carved into the Cordillera mountains.',
    description:
      'Often called the eighth wonder of the world, the Banaue terraces were hand-carved by Ifugao ancestors and are still farmed today. The Batad and Bangaan clusters offer the most dramatic amphitheater views, reached by jeepney and a steep but rewarding hike. Homestays in the villages let you wake up above the clouds.',
    latitude: 16.9354701,
    longitude: 121.0573118,
    address: 'Banaue Main Viewpoint, Banaue, Ifugao',
    openingHours: '6:00 AM – 6:00 PM',
    entranceFee: 100,
    isFeatured: true,
    categories: ['mountain', 'heritage', 'nature'],
  },
  {
    slug: 'chocolate-hills',
    name: 'Chocolate Hills',
    city: 'carmen',
    summary: 'More than a thousand grass-covered domes that turn cocoa brown in the dry season.',
    description:
      'Bohol’s signature landscape is made up of 1,268 limestone mounds spread across 50 square kilometers. The Carmen viewing deck offers the classic panorama, while the nearby Chocolate Hills Adventure Park adds rope bridges and a bike zip. Visit in the dry months between December and May for the deepest browns.',
    latitude: 9.7987699,
    longitude: 124.1673398,
    address: 'Carmen, Bohol',
    openingHours: '8:00 AM – 6:00 PM',
    entranceFee: 100,
    isFeatured: true,
    categories: ['mountain', 'nature'],
  },
  {
    slug: 'kawasan-falls',
    name: 'Kawasan Falls',
    city: 'badian',
    summary: 'Tiered turquoise falls at the end of a jungle canyon walk in southern Cebu.',
    description:
      'A short trek from the jump-off in Badian leads to three tiers of cool, mineral-blue water. Canyoneering tours start upstream at Kanlaob and finish with a leap into the main basin. Go on a weekday morning for calmer water and fewer crowds, and expect a modest environmental fee at the gate.',
    latitude: 9.8020014,
    longitude: 123.3739382,
    address: 'Matutinao, Badian, Cebu',
    openingHours: '6:00 AM – 5:00 PM',
    entranceFee: 100,
    isFeatured: true,
    categories: ['adventure', 'nature'],
  },
  {
    slug: 'cloud-9-siargao',
    name: 'Cloud 9, Siargao',
    city: 'general-luna',
    summary: 'The hollow right-hander that made Siargao the surfing capital of the Philippines.',
    description:
      'Cloud 9 breaks over a shallow reef and draws surfers from around the world, especially between August and November. Non-surfers can watch from the wooden tower, then explore the palm-lined roads of General Luna by scooter. Respect local surf etiquette and book lessons through accredited instructors.',
    latitude: 9.8133332,
    longitude: 126.1643972,
    address: 'Cloud 9 Boardwalk, Catangnan, General Luna, Surigao del Norte',
    openingHours: 'Open 24 hours',
    entranceFee: 0,
    isFeatured: true,
    categories: ['beach', 'adventure', 'island'],
  },
  {
    slug: 'intramuros',
    name: 'Intramuros',
    city: 'manila',
    summary: 'The walled city of old Manila, where Spanish colonial history meets modern galleries.',
    description:
      'Intramuros holds the country’s densest collection of colonial-era landmarks: Fort Santiago, San Agustin Church, and the Manila Cathedral. Walk the ramparts at golden hour, then refuel at a courtyard café inside the walls. Bamboo bikes and kalesa rides make the district easy to cover in an afternoon.',
    latitude: 14.5944616,
    longitude: 120.97009,
    address: 'Fort Santiago, Intramuros, Manila',
    openingHours: '8:00 AM – 6:00 PM',
    entranceFee: 75,
    isFeatured: false,
    categories: ['heritage', 'city'],
  },
  {
    slug: 'mayon-volcano',
    name: 'Mayon Volcano',
    city: 'legazpi',
    summary: 'A near-perfect cone rising over Albay, best framed from the Cagsawa ruins.',
    description:
      'Mayon’s symmetry is best appreciated from the Cagsawa Ruins in Daraga, where a 19th-century church bell tower still stands against the volcano. ATV trails lead across the lahar fields toward the base, subject to current alert levels. Check PHIVOLCS advisories before planning anything close to the permanent danger zone.',
    latitude: 13.1660559,
    longitude: 123.7010503,
    address: 'Cagsawa Ruins, Daraga, Albay (Mayon Volcano viewpoint)',
    openingHours: '5:00 AM – 7:00 PM (viewpoints)',
    entranceFee: 50,
    isFeatured: false,
    categories: ['mountain', 'nature'],
  },
  {
    slug: 'calle-crisologo',
    name: 'Calle Crisologo',
    city: 'vigan',
    summary: 'Cobblestone streets and ancestral houses in the best-preserved Spanish town in Asia.',
    description:
      'Calle Crisologo is the heart of Vigan’s UNESCO-listed heritage zone, lined with bahay na bato houses, capiz windows, and lantern-lit shops. Come at dusk when the street closes to vehicles and the cobblestones glow. Try the local empanada and a cup of antillano coffee made with sugarcane.',
    latitude: 17.5718547,
    longitude: 120.388852,
    address: 'Calle Crisologo, Vigan, Ilocos Sur',
    openingHours: 'Open 24 hours',
    entranceFee: 0,
    isFeatured: false,
    categories: ['heritage', 'city'],
  },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail) {
    throw new Error('SEED_ADMIN_EMAIL is required to seed the database');
  }
  if (!adminPassword || adminPassword.length < 16) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 16 characters');
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      displayName: 'Travelie Admin',
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: Role.ADMIN,
    },
  });

  const philippines = await prisma.country.upsert({
    where: { code: 'PH' },
    update: { name: 'Philippines' },
    create: { code: 'PH', name: 'Philippines' },
  });

  const cityIds = new Map<string, string>();
  for (const city of cities) {
    const record = await prisma.city.upsert({
      where: { countryId_slug: { countryId: philippines.id, slug: city.slug } },
      update: { name: city.name, latitude: city.latitude, longitude: city.longitude },
      create: { ...city, countryId: philippines.id },
    });
    cityIds.set(city.slug, record.id);
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const destination of destinations) {
    const cityId = cityIds.get(destination.city);
    if (!cityId) {
      throw new Error(`Unknown city ${destination.city}`);
    }

    const data = {
      name: destination.name,
      summary: destination.summary,
      description: destination.description,
      latitude: destination.latitude,
      longitude: destination.longitude,
      address: destination.address,
      openingHours: destination.openingHours,
      entranceFee: destination.entranceFee,
      isFeatured: destination.isFeatured,
      isPublished: true,
      cityId,
    };

    const record = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {
        ...data,
        categories: { set: destination.categories.map((slug) => ({ slug })) },
      },
      create: {
        ...data,
        slug: destination.slug,
        categories: { connect: destination.categories.map((slug) => ({ slug })) },
      },
    });
    await prisma.destinationPhoto.deleteMany({ where: { destinationId: record.id } });
    await prisma.destinationPhoto.create({
      data: {
        destinationId: record.id,
        url: `/static/seed/${destination.slug}.jpg`,
        alt: destination.name,
        sortOrder: 0,
      },
    });
  }

  console.log(`Seeded ${destinations.length} destinations, ${cities.length} cities.`);
  console.log(`Admin account seeded for ${admin.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });