import { db } from './index.ts';
import { users, categories, topics, topicRelations, keywords, articles, articleTopics, articleKeywords, advertisements, auditLogs, siteSettings } from './schema.ts';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('--- Starting Vastu Ritam database seed ---');

  // 1. Admin Users
  const passwordHash = await bcrypt.hash('VastuAdmin2026!', 10);
  const editorHash = await bcrypt.hash('VastuScholar2026!', 10);

  const existingUsers = await db.select().from(users);
  let adminUser = existingUsers.find(u => u.email === 'admin@vasturitam.com');
  if (!adminUser) {
    const inserted = await db.insert(users).values([
      {
        uid: 'admin_vr_master_uid',
        email: 'admin@vasturitam.com',
        displayName: 'Vastu Ritam Acharya',
        passwordHash,
        role: 'admin',
        avatarUrl: '/trademark-logo.jpg',
      },
      {
        uid: 'scholar_vr_editor_uid',
        email: 'scholar@vasturitam.com',
        displayName: 'Vedic Shastra Scholar',
        passwordHash: editorHash,
        role: 'editor',
        avatarUrl: '/trademark-logo.jpg',
      }
    ]).returning();
    adminUser = inserted[0];
    console.log('Created admin and scholar users.');
  }

  // 2. Categories
  const catData = [
    {
      name: 'Classical Vastu Vidya',
      slug: 'classical-vastu-vidya',
      description: 'Foundational canons and architectural principles from Samarāṅgaṇa Sūtradhāra, Mayamatam, and Mānasāra.',
      icon: 'BookOpen',
      metaTitle: 'Classical Vastu Vidya - Ancient Architectural Shastras',
      metaDescription: 'Explore canonical Vedic treatises, geometric proportions, and spatial harmonics from authentic manuscripts.',
      displayOrder: 1,
    },
    {
      name: 'Spiritual Knowledge',
      slug: 'spiritual-knowledge',
      description: 'Cosmic energies, presiding deities (Devatas), and metaphysical laws governing the subtle field of dwellings.',
      icon: 'Sun',
      metaTitle: 'Spiritual Knowledge & Metaphysical Vastu',
      metaDescription: 'Deities, cosmic consciousness, and sacred orientation according to Vedic cosmology.',
      displayOrder: 2,
    },
    {
      name: 'Architectural Harmony',
      slug: 'architectural-harmony',
      description: 'Practical spatial zonings, structural equilibrium, circulation pathways, and elemental alignments.',
      icon: 'Compass',
      metaTitle: 'Architectural Harmony - Practical Vastu Design',
      metaDescription: 'Designing harmonious living and work environments through precise orientation and zoning.',
      displayOrder: 3,
    },
    {
      name: 'Sacred Geography',
      slug: 'sacred-geography',
      description: 'Geomagnetic grids, solar flux, subterranean currents, and cardinal alignments.',
      icon: 'Globe',
      metaTitle: 'Sacred Geography & Earth Energies in Vastu',
      metaDescription: 'Understanding the magnetic axis of Prithvi, solar cycles, and natural resonance.',
      displayOrder: 4,
    },
  ];

  const categoryMap = new Map<string, number>();
  for (const c of catData) {
    const existing = await db.select().from(categories).where(eq(categories.slug, c.slug));
    if (existing.length === 0) {
      const inserted = await db.insert(categories).values(c).returning();
      categoryMap.set(c.slug, inserted[0].id);
    } else {
      categoryMap.set(c.slug, existing[0].id);
    }
  }
  console.log('Categories verified.');

  // 3. Topics (Entities)
  const topicData = [
    {
      name: 'Lord Brahma',
      slug: 'lord-brahma',
      sanskritName: 'ब्रह्मा',
      entityType: 'deity',
      summary: 'The cosmic progenitor and architect who presides over the central Brahmasthan in the 81-pada Vastu Mandala.',
      description: `### Cosmic Presence of Lord Brahma in Vastu Shastra

Lord Brahma represents the primordial unmanifest consciousness from which all spatial manifestation radiates. In the classical 81-pada (Paramasayika) grid, the central 9 padas constitute the **Brahmasthan**, the sanctified sanctuary where Brahma resides.

#### Canonical Significance
1. **The Etheric Hub (Akasha Tattva)**: While the peripheral zones are allocated to directional elements (Water, Fire, Air, Earth), Brahma governs the limitless element of Space/Ether.
2. **Structural Injunctions**: The *Samarāṅgaṇa Sūtradhāra* explicitly commands:
   > *"Brahma-sthane na kartavyam bhedam stambham gṛhadiṣu"*
   > (In the sanctuary of Brahma, no columns, heavy structural loads, toilets, or fire hearths must ever be erected.)
3. **Cosmic Resonance**: It is the energetic lung of the building footprint. When kept luminous, open, and elevated, vitality and spiritual balance permeate all eight peripheral zones.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Lord Brahma - Deity of the Central Brahmasthan in Vastu',
      metaDescription: 'Detailed study of Lord Brahma in Vedic architecture, his role in the Paramasayika mandala and the etheric hub.',
    },
    {
      name: 'Vastu Purusha',
      slug: 'vastu-purusha',
      sanskritName: 'वास्तु पुरुष',
      entityType: 'energy_zone',
      summary: 'The cosmic entity whose celestial form constitutes the energetic and geometric matrix of Vastu Shastra.',
      description: `### The Legend & Science of Vastu Purusha

According to the *Matsya Purana* and *Bṛhat Saṃhitā*, the Vastu Purusha manifest during the cosmic cosmic clash between the gods and titans. Bound by the 45 deities upon the earth, he lies face-downward (*adhomukha*), creating the sacred ground grid.

#### Spatial Anatomy
- **Head (Murdha)**: Positioned in the North-East (*Ishanya*), symbolizing divine intellect, wisdom, and clarity.
- **Heart & Umbilicus (Hridaya & Nabhi)**: Resting in the center (*Brahmasthan*), governing the pulse of vital Prana.
- **Hands & Arms (Bhuja)**: Reaching into the North-West (*Vayavya*) and South-East (*Agneya*), regulating kinetic movement and thermal metabolism.
- **Feet (Pada)**: Resting in the South-West (*Nirriti*), providing grounding, structural stability, and ancestral weight.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Vastu Purusha - The Living Energy Matrix of Space',
      metaDescription: 'Explore the cosmic origins, anatomy, and architectural alignments of the Vastu Purusha in sacred design.',
    },
    {
      name: 'Brahmastra',
      slug: 'brahmastra',
      sanskritName: 'ब्रह्मास्त्र',
      entityType: 'concept',
      summary: 'The pinnacle metaphysical energy matrix and invincible spiritual force associated with [[topic:lord-brahma|Lord Brahma]].',
      description: `### Brahmastra in Shastra & Metaphysical Reality

In classical Vedic lore and esoteric literature, the **Brahmastra** is renowned as the ultimate celestial weapon created by [[topic:lord-brahma|Lord Brahma]]. In spatial science and esoteric Tantra, Brahmastra refers to the concentrated focal vortex generated when the directional axes (*Brahma Sutras*) intersect with absolute precision.

#### Energetic Concentration
- **Geometric Convergence**: When the North-South (*Yama-Sutra*) and East-West (*Surya-Sutra*) lines intersect seamlessly without skew, a luminous scalar field is produced.
- **Spiritual Application**: Invoking the Brahmastra principle in sacred buildings was used in ancient temple design to protect the sanctum sanctorum (*Garbhagriha*) against seismic disturbances and negative geopathic stress.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Brahmastra - Vedic Energy Matrix & Metaphysical Power',
      metaDescription: 'Understanding the metaphysical concept of Brahmastra and its geometric convergence with Lord Brahma in Vedic shastras.',
    },
    {
      name: 'Ishana',
      slug: 'ishana',
      sanskritName: 'ईशान',
      entityType: 'deity',
      summary: 'The auspicious aspect of Lord Shiva presiding over the North-East water corner (Ishanya).',
      description: `### Ishana: The North-East Gateway of Illumination

Ishana is the supreme tranquil aspect of Shiva, holding sway over the North-East zone where the solar and geomagnetic waves converge.

#### Architectural Harmony
- **Element**: Water (*Jala*) and Pure Consciousness (*Sattva*).
- **Ideal Uses**: Meditation rooms, prayer sanctums, clean water bodies, open courtyards.
- **Injunctions**: Must always be maintained at a lower elevation than the South-West, free of clutters, toilets, and heavy steel structures.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Ishana - Lord of the North-East in Vastu Shastra',
      metaDescription: 'Detailed architectural guidelines for the North-East (Ishanya) corner governed by Lord Ishana.',
    },
    {
      name: 'Brahmasthan',
      slug: 'brahmasthan',
      sanskritName: 'ब्रह्मस्थान',
      entityType: 'energy_zone',
      summary: 'The sacred core, navel, and central etheric lung of the building footprint.',
      description: `### The Sanctity of the Brahmasthan

The Brahmasthan is the 9-pada central square in the 81-square Vastu grid. It must remain *Nirupaplavam* (unblemished and free of weight).

#### Practical Guidelines
1. Keep the center clear of pillars, staircases, and heavy beams.
2. In classical Indian courtyard architecture (*Chaupala* or *Nālukettu*), the Brahmasthan opened directly to the sky to receive unhindered cosmic Prana.
3. Placing water fountains or light sacred objects in this zone magnifies peace throughout the dwelling.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Brahmasthan - The Central Heart of Every Vastu Space',
      metaDescription: 'Comprehensive guide to the Brahmasthan: importance, rules, common errors, and remedies.',
    },
    {
      name: 'Agni Devata',
      slug: 'agni-devata',
      sanskritName: 'अग्नि',
      entityType: 'deity',
      summary: 'The cosmic transformer and fire lord residing in the South-East quadrant (Agneya).',
      description: `### Agni: The Thermodynamic Regulator

Governing the South-East, Agni oversees all transformation, digestive power, and energetic combustion in the structure.

#### Key Injunctions
- **Primary Function**: Ideal for kitchens, boilers, electrical panels, and thermal installations.
- **Elemental Conflict**: Introducing water elements (e.g. underground tanks) in Agneya extinguishes the digestive fire, leading to metabolic and financial instability.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Agni Devata - South-East Fire Quadrant in Vastu',
      metaDescription: 'Learn how to balance the Agneya corner with correct placement of fire elements and cooking appliances.',
    },
    {
      name: 'Pancha Mahabhuta',
      slug: 'pancha-mahabhuta',
      sanskritName: 'पञ्चमहाभूत',
      entityType: 'concept',
      summary: 'The five primordial cosmic elements: Prithvi, Jala, Agni, Vayu, and Akasha.',
      description: `### The Five Elements in Spatial Harmony

Every physical space is a microcosm of the universe composed of the Pancha Mahabhuta:
1. **Jala (Water)** in the North-East.
2. **Agni (Fire)** in the South-East.
3. **Prithvi (Earth)** in the South-West.
4. **Vayu (Air)** in the North-West.
5. **Akasha (Ether/Space)** in the Center.

Balancing these five elemental fields creates a frictionless biological environment for humans to thrive.`,
      imageUrl: '/trademark-logo.jpg',
      metaTitle: 'Pancha Mahabhuta - The 5 Elements of Vastu Shastra',
      metaDescription: 'Understand how Earth, Water, Fire, Air, and Ether govern different quadrants of architectural spaces.',
    },
  ];

  const topicMap = new Map<string, number>();
  for (const t of topicData) {
    const existing = await db.select().from(topics).where(eq(topics.slug, t.slug));
    if (existing.length === 0) {
      const inserted = await db.insert(topics).values(t).returning();
      topicMap.set(t.slug, inserted[0].id);
    } else {
      topicMap.set(t.slug, existing[0].id);
    }
  }
  console.log('Topics verified.');

  // 4. Topic-to-Topic Relations
  const relationsData = [
    { source: 'lord-brahma', target: 'brahmasthan', type: 'presides_over' },
    { source: 'lord-brahma', target: 'brahmastra', type: 'associated_with' },
    { source: 'vastu-purusha', target: 'brahmasthan', type: 'presides_over' },
    { source: 'vastu-purusha', target: 'ishana', type: 'associated_with' },
    { source: 'agni-devata', target: 'pancha-mahabhuta', type: 'element_ruler' },
    { source: 'ishana', target: 'pancha-mahabhuta', type: 'element_ruler' },
    { source: 'brahmasthan', target: 'pancha-mahabhuta', type: 'element_ruler' },
  ];

  for (const r of relationsData) {
    const sId = topicMap.get(r.source);
    const tId = topicMap.get(r.target);
    if (sId && tId) {
      const existing = await db.select().from(topicRelations).where(
        eq(topicRelations.sourceTopicId, sId)
      );
      if (!existing.some(rel => rel.targetTopicId === tId)) {
        await db.insert(topicRelations).values({
          sourceTopicId: sId,
          targetTopicId: tId,
          relationType: r.type,
        });
      }
    }
  }
  console.log('Topic relations established.');

  // 5. Keywords
  const kwList = [
    { name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' },
    { name: 'Brahmasthan', slug: 'brahmasthan' },
    { name: 'Sacred Geometry', slug: 'sacred-geometry' },
    { name: 'Samarāṅgaṇa Sūtradhāra', slug: 'samarangana-sutradhara' },
    { name: 'Subtle Energy Fields', slug: 'subtle-energy-fields' },
    { name: 'North-East Orientation', slug: 'north-east-orientation' },
    { name: 'Elemental Harmony', slug: 'elemental-harmony' },
    { name: 'Geopathic Stress', slug: 'geopathic-stress' },
  ];

  const keywordMap = new Map<string, number>();
  for (const kw of kwList) {
    const existing = await db.select().from(keywords).where(eq(keywords.slug, kw.slug));
    if (existing.length === 0) {
      const inserted = await db.insert(keywords).values(kw).returning();
      keywordMap.set(kw.slug, inserted[0].id);
    } else {
      keywordMap.set(kw.slug, existing[0].id);
    }
  }
  console.log('Keywords verified.');

  // 6. Articles with Internal Topic Linking
  const articleData = [
    {
      title: 'What is Brahmastra? The Metaphysical Energy of Creation & Cosmic Power',
      slug: 'brahmastra',
      excerpt: 'An authentic shastric inquiry into the Brahmastra energy matrix, its connection to Lord Brahma, and how sacred axes converge in spatial geometry.',
      content: `## The Shastric Essence of Brahmastra

In contemporary lore, the term **Brahmastra** is frequently depicted solely as an invulnerable mythic weapon. However, classical Vedic treatises approach this concept through the multidimensional lens of cosmological fields and sonic geometry. At its foundation, Brahmastra represents the supreme concentrated vibrational matrix invoked directly from [[topic:lord-brahma|Lord Brahma]], the supreme progenitor of cosmic manifestation.

### The Geometric Alignment of Sacred Energy

Within the science of **Vastu Vidya**, every built space acts as a living resonator of celestial mechanics. When the primary cardinal energy axes—the *Surya Sutra* (solar trajectory from East to West) and the *Soma Sutra* (geomagnetic flux from North to South)—intersect in immaculate equilibrium, they form a celestial hub known as the [[topic:brahmasthan|Brahmasthan]].

#### The Role of Lord Brahma in Energy Consecration
According to the *Samarāṅgaṇa Sūtradhāra*, composed by King Bhoja:
> *"Brahma jagat-kartā svayaṃbhūḥ sarva-vedavit..."*
> (Lord Brahma, self-existent creator of cosmic order, established the fundamental proportions of earthly dwellings.)

When an initiate seeks alignment with cosmic consciousness, the energy field must remain free of terrestrial distortion. This is precisely why the focal sanctuary governed by [[topic:lord-brahma|Lord Brahma]] must remain unoccupied by dense masonry or septic fixtures.

### Dynamic Interaction with the Vastu Purusha

The anatomical posture of the [[topic:vastu-purusha|Vastu Purusha]] dictates how celestial forces circulate across the ground plane:
- The supreme intellect is received through [[topic:ishana|Ishana]] in the North-East.
- The vital metabolic heat is transformed through [[topic:agni-devata|Agni Devata]] in the South-East.
- The elemental equilibrium is maintained across the [[topic:pancha-mahabhuta|Pancha Mahabhuta]].

### Practical Implications for Modern Living

1. **Unlocking the Umbilical Core**: Protect the [[topic:brahmasthan|Brahmasthan]] by ensuring light enters from the zenith.
2. **Deflecting Geopathic Distortions**: By aligning structural walls strictly with true cardinal North (rather than magnetic declination error), the resonant field of stability is preserved.
3. **Harmonizing Elemental Zones**: Respecting the five divine elements allows human inhabitants to experience sustained vitality, mental clarity, and enduring prosperity.`,
      featuredImage: '/hero-sanctuary.jpg',
      categorySlug: 'spiritual-knowledge',
      topicSlugs: ['brahmastra', 'lord-brahma', 'brahmasthan', 'vastu-purusha'],
      keywordSlugs: ['sacred-geometry', 'brahmasthan', 'subtle-energy-fields'],
      status: 'published',
      metaTitle: 'What is Brahmastra? Metaphysical Energy & Sacred Vastu',
      metaDescription: 'Discover the profound connection between Brahmastra, Lord Brahma, and the Brahmasthan in classical Vedic architectural wisdom.',
      readingTimeMinutes: 7,
      viewsCount: 342,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    },
    {
      title: 'The Secrets of the Brahmasthan: The Navel of Sacred Architecture',
      slug: 'secrets-of-the-brahmasthan',
      excerpt: 'Why ancient master architects strictly forbade weight, columns, or excavation in the central sanctum dedicated to Lord Brahma.',
      content: `## The Etheric Lung of the Built Environment

In the classical canon of Vedic architecture, the central 9 padas of the 81-pada grid are designated as the **Brahmasthan**. This is not merely an empty physical space; it is the vital umbilical center where cosmic consciousness enters the earthly residence.

### Canonical Decrees from Ancient Manuscripts

The *Mayamatam* and *Mānasāra* describe the Brahmasthan as *Nirupaplavam*—unburdened by physical load. The presiding deity, [[topic:lord-brahma|Lord Brahma]], demands unhindered expansiveness.

#### Critical Vastu Rules for the Brahmasthan:
1. **No Heavy Columns**: Columns situated directly in the geometric center create the severe flaw known as *Marma Vedha* (puncturing of vital organs).
2. **No Fire Hearths**: The metabolic hearth belongs exclusively to [[topic:agni-devata|Agni Devata]] in the South-East. Fire in the center creates energetic turbulence.
3. **No Underground Tanks or Toilets**: Subterranean voids in the center weaken the foundational grounding governed by the [[topic:vastu-purusha|Vastu Purusha]].

### Spatial Harmony with the Five Elements

The Brahmasthan embodies the element of Space (*Akasha*), which holds and unifies all other elements within the [[topic:pancha-mahabhuta|Pancha Mahabhuta]]. Without an open central hub, the life-force (*Prana*) cannot circulate freely to the peripheral rooms.`,
      featuredImage: '/palm-leaf-texture.jpg',
      categorySlug: 'classical-vastu-vidya',
      topicSlugs: ['brahmasthan', 'lord-brahma', 'vastu-purusha', 'pancha-mahabhuta'],
      keywordSlugs: ['brahmasthan', 'vastu-purusha-mandala', 'samarangana-sutradhara'],
      status: 'published',
      metaTitle: 'Secrets of the Brahmasthan in Classical Vastu Architecture',
      metaDescription: 'Learn why the Brahmasthan dedicated to Lord Brahma must remain unburdened, open, and luminous.',
      readingTimeMinutes: 6,
      viewsCount: 521,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    },
    {
      title: 'Anatomical Mapping of the Vastu Purusha in Modern Spatial Design',
      slug: 'anatomical-mapping-vastu-purusha',
      excerpt: 'How the inverted posture of the cosmic Purusha dictates spatial zoning, light orientation, and foundational stability.',
      content: `## Understanding the Cosmic Form of Vastu Purusha

The foundational archetype of sacred geometry is the **Vastu Purusha Mandala**. Rather than an abstract diagram, classical architects conceptualize the site as a living organism lying face-downward upon the earth.

### The Nine Vital Quadrants
- **North-East (Head)**: The seat of [[topic:ishana|Ishana]], governing intellect and tranquility. Light, clear openings here allow early morning UV and solar energy to illuminate the consciousness.
- **Center (Heart & Navel)**: The realm of [[topic:lord-brahma|Lord Brahma]], pulsating through the [[topic:brahmasthan|Brahmasthan]].
- **South-East (Right Arm & Digestive Plexus)**: The domain of [[topic:agni-devata|Agni Devata]], regulating thermal and kinetic vitality.
- **South-West (Feet & Spine)**: Grounded by Nirriti, providing structural stability, master bedrooms, and heavy storage.

### Integrating the Five Elements

By harmonizing the [[topic:pancha-mahabhuta|Pancha Mahabhuta]], contemporary homes avoid the subtle energetic strains that cause chronic fatigue, sleep disorders, and relational friction.`,
      featuredImage: '/emblem.jpg',
      categorySlug: 'architectural-harmony',
      topicSlugs: ['vastu-purusha', 'ishana', 'agni-devata', 'pancha-mahabhuta'],
      keywordSlugs: ['vastu-purusha-mandala', 'elemental-harmony', 'north-east-orientation'],
      status: 'published',
      metaTitle: 'Anatomical Mapping of the Vastu Purusha in Spatial Design',
      metaDescription: 'Detailed breakdown of the Vastu Purusha anatomy, 9 spatial zones, and practical room placement.',
      readingTimeMinutes: 8,
      viewsCount: 412,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      title: 'Harmonizing the Five Elements (Pancha Mahabhuta) in Contemporary Workspaces',
      slug: 'harmonizing-pancha-mahabhuta',
      excerpt: 'Balancing Water, Fire, Air, Earth, and Ether to foster collaboration, decision-making, and financial resilience.',
      content: `## The Living Geometry of Contemporary Workplaces

Modern high-stress commercial spaces frequently suffer from elemental disequilibrium: excessive artificial screens (unregulated fire), lack of natural air ventilation (stifled Vayu), and claustrophobic interior partitions (blocked Akasha).

### Restoring Elemental Equilibrium
1. **Water (Jala) in Ishanya**: Position quiet reflection zones and drinking water in the North-East overseen by [[topic:ishana|Ishana]].
2. **Fire (Agni) in Agneya**: Place server rooms, electrical distribution panels, and pantries under the watchful presence of [[topic:agni-devata|Agni Devata]].
3. **Ether (Akasha) in the Core**: Ensure open collaboration commons at the central [[topic:brahmasthan|Brahmasthan]] honoring [[topic:lord-brahma|Lord Brahma]].
4. **Earth (Prithvi) in the South-West**: Position leadership cabins and heavy executive desks to ensure grounded command and long-term vision.`,
      featuredImage: '/hero-sanctuary.jpg',
      categorySlug: 'architectural-harmony',
      topicSlugs: ['pancha-mahabhuta', 'ishana', 'agni-devata', 'brahmasthan'],
      keywordSlugs: ['elemental-harmony', 'subtle-energy-fields', 'sacred-geometry'],
      status: 'published',
      metaTitle: 'Harmonizing Pancha Mahabhuta in Corporate Workspaces',
      metaDescription: 'Vastu guidelines for modern offices: how elemental balance drives productivity, creativity, and stability.',
      readingTimeMinutes: 5,
      viewsCount: 289,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    }
  ];

  for (const art of articleData) {
    const existing = await db.select().from(articles).where(eq(articles.slug, art.slug));
    let articleId: number;
    const catId = categoryMap.get(art.categorySlug);

    if (existing.length === 0) {
      const inserted = await db.insert(articles).values({
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        featuredImage: art.featuredImage,
        categoryId: catId,
        authorId: adminUser.id,
        status: art.status,
        metaTitle: art.metaTitle,
        metaDescription: art.metaDescription,
        readingTimeMinutes: art.readingTimeMinutes,
        viewsCount: art.viewsCount,
        publishedAt: art.publishedAt,
      }).returning();
      articleId = inserted[0].id;
    } else {
      articleId = existing[0].id;
    }

    // Connect Article <-> Topics
    for (const tSlug of art.topicSlugs) {
      const topId = topicMap.get(tSlug);
      if (topId) {
        const existRel = await db.select().from(articleTopics).where(
          eq(articleTopics.articleId, articleId)
        );
        if (!existRel.some(r => r.topicId === topId)) {
          await db.insert(articleTopics).values({
            articleId,
            topicId: topId,
            isPrimary: tSlug === art.topicSlugs[0],
          });
        }
      }
    }

    // Connect Article <-> Keywords
    for (const kSlug of art.keywordSlugs) {
      const kwId = keywordMap.get(kSlug);
      if (kwId) {
        const existRel = await db.select().from(articleKeywords).where(
          eq(articleKeywords.articleId, articleId)
        );
        if (!existRel.some(r => r.keywordId === kwId)) {
          await db.insert(articleKeywords).values({
            articleId,
            keywordId: kwId,
          });
        }
      }
    }
  }
  console.log('Articles and relationships seeded.');

  // 7. Advertisements across slots
  const adData = [
    {
      title: 'Vastu Ritam Classical Architectural Consultation - Reserve Shastric Audit',
      imageUrl: '/trademark-logo.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#consultation',
      placement: 'HEADER',
      priority: 10,
      isActive: true,
      impressions: 120,
      clicks: 14,
    },
    {
      title: 'Authentic Consecrated Copper Yantras & Spatial Rectifiers',
      imageUrl: '/trademark-logo.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#artifacts',
      placement: 'ARTICLE_TOP',
      priority: 9,
      isActive: true,
      impressions: 95,
      clicks: 11,
    },
    {
      title: 'Samarāṅgaṇa Sūtradhāra Online Masterclass - Certified Vedic Scholar Program',
      imageUrl: '/hero-sanctuary.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#education',
      placement: 'ARTICLE_MIDDLE',
      priority: 8,
      isActive: true,
      impressions: 80,
      clicks: 9,
    },
    {
      title: 'Research Monographs & Ancient Palm-Leaf Manuscript Translations',
      imageUrl: '/palm-leaf-texture.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#monographs',
      placement: 'ARTICLE_BOTTOM',
      priority: 7,
      isActive: true,
      impressions: 64,
      clicks: 5,
    },
    {
      title: 'Spatial Energy Harmonization Diagnostic Kit - 81-Pada Assessment',
      imageUrl: '/emblem.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#mandala',
      placement: 'SIDEBAR',
      priority: 10,
      isActive: true,
      impressions: 110,
      clicks: 16,
    },
    {
      title: 'Vastu Ritam Institutional Archive Mobile Guide',
      imageUrl: '/trademark-logo.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#mobile',
      placement: 'MOBILE',
      priority: 6,
      isActive: true,
      impressions: 45,
      clicks: 3,
    },
    {
      title: 'Vastu Ritam Foundation - Preserving Vedic Shastra Manuscripts',
      imageUrl: '/trademark-logo.jpg',
      destinationUrl: 'https://vasturitam.ai.studio/#foundation',
      placement: 'FOOTER',
      priority: 5,
      isActive: true,
      impressions: 78,
      clicks: 8,
    },
  ];

  for (const ad of adData) {
    const existing = await db.select().from(advertisements).where(eq(advertisements.placement, ad.placement));
    if (existing.length === 0) {
      await db.insert(advertisements).values(ad);
    }
  }
  console.log('Advertisements seeded.');

  // 8. Site Settings / Contact Details
  const existingSettings = await db.select().from(siteSettings);
  if (existingSettings.length === 0) {
    await db.insert(siteSettings).values({
      primaryPhone: '+91 98200 18272',
      secondaryPhone: '+91 98200 45678',
      primaryEmail: 'contact@vasturitam.com',
      consultationEmail: 'consultation@vasturitam.com',
      whatsappNumber: '+919820018272',
      whatsappNotice: '✦ WhatsApp Available for Blueprint Sharing',
      consultationTimings: 'Monday – Saturday: 10:00 AM – 6:30 PM (IST)',
      appointmentNotice: 'Prior appointment required for in-depth architectural floor plan audit.',
      youtubeUrl: 'https://youtube.com',
      youtubeHandle: '@VastuRitam',
      twitterUrl: 'https://x.com',
      twitterHandle: '@VastuRitam',
      officeAddress: 'Vastu Ritam Research & Vedic Architecture Sanctuary, Pune / Mumbai, Maharashtra, Bharat',
      collaborationNotice: 'Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers.',
      logoUrl: '/trademark-logo.jpg',
    });
    console.log('Site contact settings initialized.');
  }

  // 9. Audit Log
  await db.insert(auditLogs).values({
    userId: adminUser.id,
    action: 'SYSTEM_SEED',
    entityType: 'DATABASE',
    entityId: 'ALL',
    details: 'Initial authentic knowledgebase seed populated into Cloud SQL PostgreSQL',
  });

  console.log('--- Vastu Ritam database seed completed successfully ---');
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
