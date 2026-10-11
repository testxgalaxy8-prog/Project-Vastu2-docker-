import { DictionaryTerm, Article, Handbook, MythItem, Testimonial } from '../types';

export const FOUNDER_INFO = {
  title: "Founder and Research Scholar",
  institution: "Vastu Ritam",
  qualifications: [
    "Chartered Accountant (CA)",
    "Bachelor of Laws (LL.B.)",
    "Master's in Vastu Shastra",
    "Ph.D. Research Scholar (Vastu Shastra)"
  ],
  areasOfInterest: [
    "Vastu Shastra",
    "Astro-Vastu",
    "Remedies (Traditional + Modern)",
    "Classical Textual Research",
    "Architectural Interpretation"
  ],
  bio: "Combining the analytical rigor of chartered accountancy and legal jurisprudential logic with profound research into classical Vedic treatises, our founder approaches Vastu as an empirical, philosophical, and spatial science. Rather than promoting superstitious dependencies or anxiety-inducing remedies, our scholarship centers on first principles, textual integrity (Mayamatam, Manasara, Samarangana Sutradhara), and contextual integration with contemporary architecture and structural engineering."
};

export const EMBLEM_EXPLANATIONS = [
  {
    id: "lotus",
    title: "The Lotus (पद्म)",
    subheading: "North-East (Ishanya)",
    color: "from-pink-500/20 to-rose-500/10",
    borderColor: "border-pink-500",
    badge: "Wisdom & Purity",
    explanation: "Positioned in the north-east (Ishanya), the lotus represents knowledge, purity, and the continuous pursuit of higher understanding. In classical Vastu, Ishanya is the zone of pure ether (Akasha) and water (Jala), the threshold through which subtle cosmic and solar prana enters the dwelling. The blossoming lotus reminds us that architectural design should elevate consciousness and maintain sanctity."
  },
  {
    id: "stem",
    title: "The Unfinished Stem (अनावृत्त नाल)",
    subheading: "Open Boundless Circle",
    color: "from-amber-500/20 to-emerald-500/10",
    borderColor: "border-amber-600",
    badge: "Limitless Wisdom",
    explanation: "The stem begins at the lotus and encircles the Mandala without completing the circle. It symbolises that knowledge is limitless. No individual or institution can claim complete understanding; there is always more to learn. This embodies intellectual humility, honest inquiry, and an enduring quest to research and expand authentic knowledge rather than settling into rigid dogma."
  },
  {
    id: "colours",
    title: "The Colours (रङ्ग द्वय)",
    subheading: "Red & Green Harmony",
    color: "from-red-500/20 to-emerald-500/20",
    borderColor: "border-red-600",
    badge: "Action & Discernment",
    explanation: "Red signifies purposeful action and transformation. Green signifies knowledge, learning, growth, and discernment. Together, they reflect the inseparable relationship between wisdom and action. Knowledge without practical application remains inactive; action without classical understanding remains perilous. Balance between red and green achieves true harmony."
  },
  {
    id: "mandala",
    title: "The Mandala (वास्तु मण्डल)",
    subheading: "The 9-Fold Grid Order",
    color: "from-emerald-500/20 to-amber-500/10",
    borderColor: "border-emerald-600",
    badge: "Spatial Order",
    explanation: "The Mandala represents the ordered relationship between space, direction, and the Vastu Purusha. The simplified nine-fold division symbolises the nine primary spatial zones (Navakhanda) and the harmonious organisation of built space. Each quadrant resonates with distinct elemental frequencies (Pancha Mahabhuta) governing human vitality and productivity."
  },
  {
    id: "purusha",
    title: "The Vastu Purusha (वास्तु पुरुष)",
    subheading: "Cosmic Dwelling Presence",
    color: "from-orange-500/20 to-red-500/10",
    borderColor: "border-orange-600",
    badge: "Reverence to Nature",
    explanation: "The Vastu Purusha is shown respectfully aligned within the Mandala, reminding us that every space exists within a larger natural order that deserves understanding rather than domination. The Purusha's posture—head resting in the North-East, feet in the South-West, navel at the Brahmasthana—instructs us to treat every building as a living, breathing entity."
  },
  {
    id: "motto",
    title: "Our Motto (ध्‍येयवाक्यम्)",
    subheading: "संतुलन · समृद्धि · सौख्यम्",
    color: "from-red-600/20 to-amber-600/10",
    borderColor: "border-red-700",
    badge: "Vedic Foundation",
    explanation: "संतुलन (Balance) forms the foundation of every space and leads to Prosperity.\nसमृद्धि (Prosperity) arises when balance allows life and work to flourish and therefore nurtures Well-being.\nसौख्यम् (Well-Being) is the ultimate objective—a state of physical comfort, mental peace, and holistic harmony.\n\nThese three ideals form the foundation of every consultation, publication, and educational initiative undertaken by Vastu Ritam."
  }
];

export const PHILOSOPHY_PRINCIPLES = [
  {
    number: "01",
    title: "Understanding before application",
    sanskrit: "ज्ञानात् पूर्वम् अनुशीलनम्",
    description: "Every recommendation must arise from a clear understanding of the space, its purpose, its occupants, and the principles governing it—not from assumptions or fear."
  },
  {
    number: "02",
    title: "Knowledge before remedies",
    sanskrit: "उपायात् पूर्वम् तत्त्वबोधः",
    description: "No two spaces are identical. Every recommendation should be based on first principles rather than rigid formulas. Instead of putting all yantras, understand the meaning of the yantra or pyramid, get convinced, and only then introduce that remedy in your space."
  },
  {
    number: "03",
    title: "Principles before prescriptions",
    sanskrit: "विधेः पूर्वम् सिद्धान्तः",
    description: "We respect classical wisdom while encouraging thoughtful study and informed interpretation. When the foundational principles are thoroughly comprehended, the right architectural decisions become self-evident."
  }
];

export const COLLABORATORS_DATA = [
  {
    category: "Professional Collaborators",
    sanskrit: "व्यावसायिक सहयोगिनः",
    description: "Architects, engineers, and designers collaborating to integrate timeless orientation science into contemporary functional structures.",
    items: [
      { role: "Architects", detail: "Integrating solar paths, natural cross-ventilation, and magnetic alignments seamlessly into blueprint layouts without compromising structural aesthetics." },
      { role: "Civil Engineers", detail: "Aligning load distributions, heavy structural pillars, underground tanks, and plumbing lines with directional earth energies." },
      { role: "Interior Designers", detail: "Balancing color frequencies, interior furniture orientation, functional room ergonomics, and element allocations." },
      { role: "Builders & Developers", detail: "Planning townships, multi-unit residential towers, gated communities, and commercial complexes with balanced land contours." }
    ]
  },
  {
    category: "Academic Collaborators",
    sanskrit: "शैक्षणिक एवं अनुसन्धान सहयोगिनः",
    description: "Scholars, university researchers, and inquisitive students dedicated to textual cross-examination and rigorous empirical validation.",
    items: [
      { role: "Researchers", detail: "Conducting systematic comparative studies across classical manuscripts including Mayamatam, Manasara, and Brihat Samhita." },
      { role: "Students & Teachers", detail: "Engaging in structured curriculum, architectural history studies, and foundational workshops devoid of commercial myth-making." }
    ]
  },
  {
    category: "Community Collaborators",
    sanskrit: "नागरिक एवं समाज सहयोगिनः",
    description: "Individuals and families building, purchasing, or renovating their sanctuaries for lifelong peace and prosperity.",
    items: [
      { role: "Home Owners", detail: "Creating living spaces that provide restorative sleep, emotional peace, and harmonious family relationships through sound spatial layout." },
      { role: "Property Buyers", detail: "Evaluating site shape, slope, road thrusts (Veedhi Shoola), and magnetic alignment before investing significant capital." }
    ]
  }
];

export const SERVICES_DATA = [
  {
    id: "residential",
    title: "Residential Vastu",
    sanskrit: "गृह वास्तु",
    tagline: "Cultivating sanctuaries of peace, vitality, and family equilibrium",
    intro: "Whether you are building a new home, renovating an existing one, or simply looking for guidance, we help you create a living space that feels balanced, comfortable, and in harmony with Vastu principles.",
    focusAreas: [
      "Optimal bedroom placement for restorative biorhythm and mental rejuvenation (South-West / Nairutya)",
      "Kitchen fire placement honoring the Agni quadrant for nutritional vitality (South-East)",
      "Uncluttered Brahmasthana (central spatial matrix) for natural cosmic light and ventilation",
      "Prayer, contemplation, and study zones aligned with Ishanya (North-East) solar influx",
      "Remedies without non-destructive structural alterations wherever feasible"
    ]
  },
  {
    id: "commercial",
    title: "Commercial Vastu",
    sanskrit: "व्यावसायिक वास्तु",
    tagline: "Energizing enterprises, productivity, and sustainable prosperity",
    intro: "Every workplace has its own purpose. We help businesses plan offices, shops, clinics, and commercial spaces that support both functionality and a positive working environment.",
    focusAreas: [
      "Executive cabin and leadership seating aligned for clarity and strategic stability",
      "Marketing, sales, and transaction desks positioned in vibrant momentum quadrants",
      "Reception, cashier counter, and financial vaults placed in the Kuber (North) trajectory",
      "Employee workstation ergonomics designed to reduce cognitive burnout and optimize team collaboration",
      "Integration with corporate aesthetic guidelines and brand architectural language"
    ]
  },
  {
    id: "industrial",
    title: "Industrial Vastu",
    sanskrit: "औद्योगिक वास्तु",
    tagline: "Synchronizing heavy manufacturing, logistics, and human safety",
    intro: "Factories and industrial units have unique requirements. We help apply Vastu principles while respecting the practical needs of manufacturing, storage, and day-to-day operations.",
    focusAreas: [
      "Machinery weight distribution honoring earth heavy zones (South and West)",
      "Boilers, furnaces, substations, and electrical transformers oriented to the Agni quadrant",
      "Raw materials inventory vs finished goods warehouse flow optimization",
      "Effluent treatment plants, water storage tanks, and drainage gradient alignment",
      "Safety record enhancement and labor force spatial harmony"
    ]
  },
  {
    id: "before-you-buy",
    title: "Vastu Before You Buy",
    sanskrit: "क्रयण पूर्व वास्तु परीक्षण",
    tagline: "Clarity and confidence before committing your lifelong investment",
    intro: "Planning to buy a home, office, or plot? We help you understand its Vastu strengths and considerations before you make your decision.",
    focusAreas: [
      "Plot shape examination (Chatushkona, Gomukhi, Shermukhi) and topographical slope gradients",
      "Surrounding environmental factors: road thrusts (Veedhi Shoola), high-tension wires, water bodies",
      "Apartment floor plan audit: entrance door orientation, kitchen, and master bedroom balance",
      "Identification of irreparable defects vs easily harmonizable layout attributes",
      "Unbiased, independent evaluation free of broker or developer bias"
    ]
  }
];

export const SHABD_KOSH_DATA: DictionaryTerm[] = [
  {
    id: "1",
    term: "Vastu Purusha Mandala",
    sanskrit: "वास्तु पुरुष मण्डल",
    category: "Cosmology",
    meaning: "The metaphysical cosmic diagram and spatial grid upon which all sacred and domestic architecture is planned, depicting cosmic consciousness embodied in physical form.",
    architecturalSignificance: "Serves as the master proportioning framework dividing site areas into 64 (Manduka) or 81 (Paramashayika) grids to allot specific household and public functions to appropriate cosmic deities.",
    scripturalReference: "Brihat Samhita, Ch. 53; Mayamatam, Ch. 7"
  },
  {
    id: "2",
    term: "Brahmasthana",
    sanskrit: "ब्रह्मस्थान",
    category: "Architecture",
    meaning: "The luminous center of the dwelling or plot, governed by Lord Brahma (the creative source), representing the element of Space/Ether (Akasha).",
    architecturalSignificance: "Must remain free of heavy structural load, columns, toilets, staircases, and kitchens. In traditional courtyards, it serves as the open-to-sky central atrium promoting thermodynamic convection.",
    scripturalReference: "Manasara, Ch. 12"
  },
  {
    id: "3",
    term: "Ishanya",
    sanskrit: "ईशान्य",
    category: "Directions",
    meaning: "The North-East directional quadrant, ruled by Ishana (manifestation of Lord Shiva) and associated with the element of Water (Jala) and early morning solar rays.",
    architecturalSignificance: "Ideal for prayer rooms, meditation, library, underground water sumps, and open courtyards. Must be kept light, clean, and lower in level than the South-West.",
    scripturalReference: "Samarangana Sutradhara"
  },
  {
    id: "4",
    term: "Agneya",
    sanskrit: "आग्नेय",
    category: "Directions",
    meaning: "The South-East directional quadrant, ruled by Agni Deva (the cosmic fire principle) and governing transformation, metabolic energy, and vigor.",
    architecturalSignificance: "Optimal location for the culinary hearth, kitchen, electrical distribution panels, boilers, and transformers. Water elements placed here induce energetic clash.",
    scripturalReference: "Vishvakarma Prakash"
  },
  {
    id: "5",
    term: "Nairutya",
    sanskrit: "नैऋत्य",
    category: "Directions",
    meaning: "The South-West directional quadrant, governed by Nirriti and corresponding to the Earth element (Prithvi), signifying grounding, stability, and load-bearing strength.",
    architecturalSignificance: "Should ideally be the highest and heaviest sector of the building. Perfect for the master bedroom, patriarchal/matriarchal head, and heavy storage.",
    scripturalReference: "Mayamatam"
  },
  {
    id: "6",
    term: "Vayavya",
    sanskrit: "वायव्य",
    category: "Directions",
    meaning: "The North-West quadrant, ruled by Vayu (the Wind deity) and associated with the Air element (Vayu), movement, commerce, communication, and change.",
    architecturalSignificance: "Suitable for guest rooms, married daughters' quarters, finished goods dispatch, garage, and dynamic commercial interactions.",
    scripturalReference: "Brihat Samhita"
  },
  {
    id: "7",
    term: "Ayadi Shadvarga",
    sanskrit: "आयादि षड्वर्ग",
    category: "Measures",
    meaning: "The classical six mathematical formulas (Aya, Vyaya, Yoni, Rashi, Varna, Ayu) used to determine auspicious dimensions for building perimeters.",
    architecturalSignificance: "Ensures the dimensional resonance of the building aligns harmoniously with planetary and energetic frequencies of the owner.",
    scripturalReference: "Mayamatam, Ch. 9"
  },
  {
    id: "8",
    term: "Marma Sthana",
    sanskrit: "मर्म स्थान",
    category: "Architecture",
    meaning: "Vital junction points and intersecting energy lines within the Vastu Purusha grid analogous to acupuncture points in human anatomy.",
    architecturalSignificance: "Structural pillars, heavy foundation footings, and plumbing piercing these intersections generate subtle structural stress and occupant unease.",
    scripturalReference: "Manasara, Ch. 15"
  },
  {
    id: "9",
    term: "Veedhi Shoola",
    sanskrit: "वीथी शूल",
    category: "Architecture",
    meaning: "Road spear or road thrust—where an oncoming thoroughfare terminates directly into the property perimeter.",
    architecturalSignificance: "Depending on the directional quadrant and approach angle, it can either channel concentrated prana (positive) or excessive vibrational stress (negative).",
    scripturalReference: "Vishvakarma Prakash"
  }
];

export const PRAKARAN_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition",
    sanskritTitle: "उपाय-भ्रान्ति-निवारणम्",
    readTime: "7 min read",
    category: "Foundational Philosophy",
    author: "Vastu Ritam Research Desk",
    summary: "Why installing commercial pyramids and yantras without understanding spatial physics creates psychological dependency rather than genuine harmony.",
    content: "In contemporary practice, Vastu has frequently been reduced to fear-based commodification. Property owners are told that minor directional deviations will cause catastrophic failure unless they purchase expensive metallic items or tear down load-bearing walls.\n\nAt Vastu Ritam, we return to the root texts: Mayamatam, Manasara, and Samarangana Sutradhara. The ancient Acharyas were master architects, town planners, and environmental physicists. They understood solar angles, earth magnetic fluxes, prevailing wind directions, and thermodynamic air circulation.\n\nWhen we understand WHY a kitchen is placed in Agneya (South-East)—to harness ultraviolet morning rays for kitchen sanitation while preventing infrared afternoon heat from spoiling stored grains—we realize that solutions should begin with architectural intelligence, not blind panic.",
    keyTakeaway: "True Vastu empowers the occupant through rational understanding rather than breeding fear and commercial remedy reliance."
  },
  {
    id: "2",
    title: "The Brahmasthana: The Luminous Heart of Spatial Architecture",
    sanskritTitle: "ब्रह्मस्थानस्य वैज्ञानिक-रहस्यम्",
    readTime: "9 min read",
    category: "Architectural Physics",
    author: "Ph.D. Research Scholar",
    summary: "An analytical study of central void spaces in traditional Indian courtyards and their thermodynamic cooling efficacy.",
    content: "The Brahmasthana represents the geometric and energetic center of any built form. In traditional Indian domestic architecture, known as 'Nalukettu' in Kerala, 'Wada' in Maharashtra, or 'Haveli' in Rajasthan, this space was left open to the sky as a central courtyard (Angana).\n\nModern environmental engineering now validates what classical texts stated thousands of years ago: the open center creates a natural 'stack effect'. As ambient indoor air warms up during daytime occupancy, it rises and escapes through the central courtyard, drawing cool air from perimeter shaded gardens.\n\nWhen modern developers place elevator shafts, heavy RCC shear walls, or drainage stacks in this exact center, both acoustic tranquility and thermal airflow are severely compromised.",
    keyTakeaway: "Keeping the center unobstructed is both an energetic mandate and a proven ecological design principle."
  },
  {
    id: "3",
    title: "The Geometry of the Mandala: The 81-Grid Paramashayika Explained",
    sanskritTitle: "परमशायिक मण्डल विवेचनम्",
    readTime: "11 min read",
    category: "Vedic Mathematics",
    author: "Vastu Ritam Academic Council",
    summary: "Deconstructing the mathematical allocations of 45 deities within the sacred architectural matrix.",
    content: "The Paramashayika Mandala is an 81-square grid (9x9) utilized for residential and municipal planning. Within this grid, 32 deities occupy the external perimeter (Padadevatas) governing environmental interfaces, while 13 deities govern internal sectors.\n\nEach deity corresponds to a specific qualitative energy of nature. For instance, Parjanya represents rain and gentle moisture, Varuna represents oceanic depths and liquidity, and Yama represents disciplined mortality and resting cycles. Understanding these allocations allows contemporary architects to align functional programming (HVAC, server rooms, bedrooms, water storage) with classical energetic alignments.",
    keyTakeaway: "The Mandala is not a mystical talisman, but an advanced computational matrix for zoning human activities."
  }
];

export const HANDBOOKS_DATA: Handbook[] = [
  {
    id: "1",
    title: "Vastu for Contemporary Architects",
    subtitle: "A Field Guide to Seamless Integration with Modern CAD & BIM Workflows",
    targetAudience: "Architects & Urban Planners",
    pages: 48,
    topics: ["Solar Vector Mapping", "Brahmasthan in Multi-Story Apartments", "Façade Openings vs Dik-Bala", "Non-Destructive Layout Optimization"],
    summary: "Written specifically for registered architects who want to respect client Vastu sentiments while preserving aesthetic integrity and building code compliance."
  },
  {
    id: "2",
    title: "The Informed Homebuyer's Vastu Checklist",
    subtitle: "What to Observe Before Signing Property Deeds",
    targetAudience: "Home Buyers & Real Estate Investors",
    pages: 36,
    topics: ["Evaluating Main Entrance Pada", "Slope & Drainage Verification", "Surrounding Negative Structures", "Separating Remediable Flaws from Critical Defects"],
    summary: "A transparent, easy-to-follow guide to protect your life savings from high-risk property purchases without being misled by sensationalist claims."
  },
  {
    id: "3",
    title: "Industrial & Factory Spatial Harmonics",
    subtitle: "Aligning Heavy Machinery, Substations, and Inventory Logistics",
    targetAudience: "Plant Managers & Civil Engineers",
    pages: 54,
    topics: ["Earth-Bearing Capacity in Nairutya", "Hazardous Chemical Storage in Agni", "Raw Material Inflow vs Finished Goods Outflow", "Workforce Well-being"],
    summary: "A practical technical treatise for manufacturing facilities, warehouse logistics, and corporate processing plants."
  }
];

export const MYTHS_DATA: MythItem[] = [
  {
    id: "1",
    myth: "All South-facing homes or entrances are inauspicious and bring misfortune.",
    misconceptionContext: "A widespread commercial myth that has caused property buyers to reject otherwise structurally sound and well-lit properties.",
    classicalTruth: "Classical texts like Brihat Samhita and Mayamatam divide each direction into 8 equal entrance zones (Padas). In the South, entrances positioned in the 3rd and 4th Padas (named Vitatha and Grihakshata) are highly praised for prosperity and disciplined success.",
    scripturalPrinciple: "Mayamatam Ch. 9, Sloka 42 explicitly enumerates the beneficial padas of the Southern sector for specific vocations and administrative strength.",
    practicalHarm: "Unnecessary panic, refusal of good real estate investments, and arbitrary alterations."
  },
  {
    id: "2",
    myth: "You must break walls or demolish structures to correct any Vastu defect.",
    misconceptionContext: "Fear-mongering advice that leads to expensive structural damage and legal building violations.",
    classicalTruth: "Traditional texts prioritize functional repurposing, elemental rebalancing (Pancha Tattva adjustment through lighting, colors, textures, sound), and usage realignment. Structural demolition is strictly a last resort and often counter-indicated if it harms the overall structural integrity.",
    scripturalPrinciple: "Vishvakarma Prakash emphasizes that disturbing load-bearing Marmas (vital points) during haphazard demolition creates far greater disturbance than the original defect.",
    practicalHarm: "Huge financial loss, weakening of RCC frames, and severe emotional distress."
  },
  {
    id: "3",
    myth: "Installing numerous metallic pyramids and plastic yantras fixes everything.",
    misconceptionContext: "Commercialization where vendors sell mass-manufactured items claiming instant miracle remedies.",
    classicalTruth: "Authentic Vastu does not rely on commercial trinkets. A yantra is a sacred geometric contemplative device used in sadhana; it does not nullify severe architectural misplacements like an underground septic tank in the North-East or a kitchen in the South-West.",
    scripturalPrinciple: "'We do not begin with remedies. We begin with understanding.' First principles must be respected; remedies are only meaningful when the underlying spatial mechanics are addressed.",
    practicalHarm: "False sense of security while root environmental problems remain unaddressed."
  },
  {
    id: "4",
    myth: "Vastu is a religious dogma tied only to ritualistic belief.",
    misconceptionContext: "Dismissal of Vastu as mere superstition or exclusively sectarian ritual.",
    classicalTruth: "Vastu Shastra is fundamentally an ancient architectural and environmental science combining geobiology, solar astronomy, magnetism, and structural mechanics. It applies universally to any enclosed human dwelling on Earth.",
    scripturalPrinciple: "Treatises such as Samarangana Sutradhara discuss materials, stone selection, soil testing (Bhumi Pariksha), and water table depths with scientific objectivity.",
    practicalHarm: "Deprives modern design of millennia of empirical spatial wisdom."
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "1",
    name: "Ar. Rajesh Mehta",
    designation: "Senior Principal Architect",
    organization: "Mehta & Associates Architects",
    location: "Mumbai & Pune",
    quote: "Working with Vastu Ritam has completely transformed how our firm views Vastu. For the first time, we collaborated with scholars who speak the language of architecture, solar angles, and structural loads. They never demanded arbitrary demolition or superstitious remedies. Their recommendations enhanced our spatial flow while giving our clients absolute peace of mind.",
    category: "Architect",
    avatarInitials: "RM"
  },
  {
    id: "2",
    name: "Er. Anand Kulkarni",
    designation: "Chief Structural Consultant",
    organization: "Apex Infrastructure Solutions",
    location: "Bengaluru",
    quote: "As a structural engineer with 25 years of experience, I was historically skeptical of Vastu consultants who would recommend cutting columns or puncturing beams. Vastu Ritam's approach is founded on first principles and classical research. Their intellectual honesty and non-destructive methodology make them the gold standard for our projects.",
    category: "Engineer",
    avatarInitials: "AK"
  },
  {
    id: "3",
    name: "Sunita Rao",
    designation: "Creative Director",
    organization: "Sanskriti Interior Design Studio",
    location: "Hyderabad",
    quote: "Their motto 'We do not begin with remedies. We begin with understanding' is 100% genuine. Instead of cluttering my interior designs with random brass items, they guided us on lighting, subtle material textures, and functional zone allocations. Our luxury villa clients are deeply satisfied.",
    category: "Interior Designer",
    avatarInitials: "SR"
  },
  {
    id: "4",
    name: "Vikram & Meera Joshi",
    designation: "Homeowners",
    organization: "Independent Villa Residents",
    location: "Ahmedabad",
    quote: "Before moving into our new bungalow, we were terrified by conflicting advice from relatives and internet videos. Vastu Ritam took our floor plan, patiently explained the logic behind every direction, and helped us make minor furniture and room adjustments without spending a fortune. Our home feels profoundly serene.",
    category: "Homeowner",
    avatarInitials: "VJ"
  },
  {
    id: "5",
    name: "Siddharth Singhania",
    designation: "Managing Director",
    organization: "Singhania Polymers Pvt. Ltd.",
    location: "Surat Industrial Corridor",
    quote: "When we expanded our manufacturing plant, our machinery layout had complex logistical constraints. Vastu Ritam worked with our plant engineers to balance heavy earth zones and electrical substations seamlessly. The clarity, professionalism, and research grounding were extraordinary.",
    category: "Commercial",
    avatarInitials: "SS"
  }
];

export const DIRECTIONAL_ZONES = [
  {
    code: "NE",
    name: "Ishanya (ईशान्य)",
    direction: "North-East",
    element: "Water & Ether (जल / आकाश)",
    deity: "Ishana (Shiva)",
    attributes: "Wisdom, clarity, spiritual influx, pristine purity",
    recommendation: "Prayer sanctuary, study, library, light water bodies, open terrace",
    caution: "Avoid toilets, kitchens, overhead heavy water tanks, or staircases"
  },
  {
    code: "E",
    name: "Purva (पूर्व)",
    direction: "East",
    element: "Solar Light (सूर्य / अग्नि)",
    deity: "Indra & Surya",
    attributes: "Vitality, vision, early morning prana, enlightenment",
    recommendation: "Main entrance, living room, expansive window glazing, verandas",
    caution: "Keep boundaries low; avoid tall blocking structures that obstruct morning light"
  },
  {
    code: "SE",
    name: "Agneya (आग्नेय)",
    direction: "South-East",
    element: "Fire (अग्नि)",
    deity: "Agni Deva",
    attributes: "Transformation, digestive metabolic fire, active energy",
    recommendation: "Kitchen culinary hearth, electric meters, generators, boiler units",
    caution: "Strictly avoid water sumps, master bedrooms, and prolonged restful stays"
  },
  {
    code: "S",
    name: "Dakshina (दक्षिण)",
    direction: "South",
    element: "Earth / Heavy Fire (पृथ्वी / अग्नि)",
    deity: "Yama",
    attributes: "Discipline, legal stability, fame, endurance",
    recommendation: "Bedrooms, heavy furniture, higher boundary walls, overhead storage",
    caution: "Avoid deep underground water reservoirs or sunken open atriums"
  },
  {
    code: "SW",
    name: "Nairutya (नैऋत्य)",
    direction: "South-West",
    element: "Earth (पृथ्वी)",
    deity: "Nirriti",
    attributes: "Stability, authority, grounding, load bearing",
    recommendation: "Master bedroom, owner's executive cabin, heaviest building height",
    caution: "Never locate underground water sumps, wells, main entrance, or open voids"
  },
  {
    code: "W",
    name: "Pashchima (पश्चिम)",
    direction: "West",
    element: "Water / Air (जल / वायु)",
    deity: "Varuna",
    attributes: "Sustenance, celebration, financial stability",
    recommendation: "Dining room, children's bedroom, overhead water tanks, study desks",
    caution: "Avoid keeping it lower in elevation than the East or North"
  },
  {
    code: "NW",
    name: "Vayavya (वायव्य)",
    direction: "North-West",
    element: "Air (वायु)",
    deity: "Vayu Deva",
    attributes: "Movement, change, communication, commercial velocity",
    recommendation: "Guest bedroom, dispatch storage, garage, married daughters' room",
    caution: "Do not place master bedroom or heavy permanent vaults here"
  },
  {
    code: "N",
    name: "Uttara (उत्तर)",
    direction: "North",
    element: "Water / Magnetic (जल / चुम्बकीय)",
    deity: "Kuber (Lord of Wealth)",
    attributes: "Prosperity, cash flow, new career opportunities, magnetic prana",
    recommendation: "Cash lockers, accounts department, open gardens, water fountains",
    caution: "Avoid heavy clutter, waste dumps, and high solid obstruction walls"
  },
  {
    code: "CENTER",
    name: "Brahmasthana (ब्रह्मस्थान)",
    direction: "Center / Navel",
    element: "Ether (आकाश)",
    deity: "Lord Brahma",
    attributes: "Universal cosmic balance, life breath, spatial equilibrium",
    recommendation: "Open courtyard, luminous skylight, unencumbered circulation hall",
    caution: "No structural columns, staircases, toilets, septic tanks, or heavy machinery"
  }
];
