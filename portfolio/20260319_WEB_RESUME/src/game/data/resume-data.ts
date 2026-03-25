export interface InfoCard {
  period: string;
  company: string;
  position: string;
  division: string;
  /** Custom labels override defaults (📅 PERIOD, 🏢 COMPANY, 💼 POSITION, 🏷 DIVISION) */
  labels?: [string, string, string, string];
  /** Show pixel art portrait in the card */
  showPortrait?: boolean;
}

export interface ResumeZone {
  id: string;
  title: string;
  icon: string;
  worldX: number;
  content: ZoneContent;
  infoCard?: InfoCard;
}

export interface ZoneContent {
  heading: string;
  subtitle?: string;
  items: ContentItem[];
}

export interface ContentItem {
  title: string;
  subtitle?: string;
  period?: string;
  description?: string;
  tags?: string[];
  bullets?: string[];
}

export const PROFILE = {
  name: 'Chayuthpong Makmontrisrisuk',
  title: 'Product Development Specialist | Full-Stack Developer | Data Engineer',
  location: 'Bangkok, Thailand',
  email: 'chayuthpong.makmontrisrisuk@hotmail.com',
  phone: '+66 63 998 9990',
  summary:
    'Results-driven Product Development Specialist with 14+ years of experience spanning full-stack development, data engineering, and process automation.',
};

export const RESUME_ZONES: ResumeZone[] = [
  {
    id: 'education',
    title: 'Education',
    icon: '🎓',
    worldX: 400,
    infoCard: { period: '2007 — Present', company: 'KMITL / TUXSA / BornToDev', position: 'Education', division: 'Computer Engineering → AI & IoT' },
    content: {
      heading: 'Education',
      items: [
        {
          title: "International Master's — AI & IoT",
          subtitle: 'TUXSA (Thammasat University)',
          period: '2025 — Present',
          description: 'In Progress',
        },
        {
          title: 'Full-Stack Development Boot Camp (Batch 3)',
          subtitle: 'BornToDev',
          period: '2025 — 2026',
        },
        {
          title: 'B.Eng — Computer Engineering',
          subtitle: "King Mongkut's Institute of Technology Ladkrabang (KMITL)",
          period: '2007 — 2010',
        },
      ],
    },
  },
  {
    id: 'experience-1',
    title: 'Agility (2011)',
    icon: '💼',
    worldX: 800,
    infoCard: { period: '2011 — 2015', company: 'Agility Logistics', position: 'Programmer Officer', division: 'IT Department' },
    content: {
      heading: 'Programmer Officer',
      subtitle: 'Agility Logistics — IT Department (Aug 2011 — 2015)',
      items: [
        {
          title: 'Fleet Management System',
          description: 'Built vehicle tracking and maintenance scheduling, improving fleet utilization by 20%.',
        },
        {
          title: 'Cargo Management System',
          description: 'Streamlined warehouse-to-delivery workflows.',
        },
        {
          title: 'Reflection Macro (CMS → AS400)',
          description: 'Automated legacy system data transfers, reducing migration time by 70%.',
        },
      ],
    },
  },
  {
    id: 'experience-2',
    title: 'TRUE Corp',
    icon: '📡',
    worldX: 1200,
    infoCard: { period: '2015 — 2018', company: 'TRUE Corporation', position: 'Senior Programmer', division: 'Learning Center' },
    content: {
      heading: 'Senior Programmer',
      subtitle: 'TRUE Corporation — Learning Center (Jul 2015 — Nov 2018)',
      items: [
        {
          title: 'SQL Fundamentals Course',
          description: 'Designed curriculum adopted across multiple business units, training 200+ staff.',
        },
        {
          title: 'Tech Trends Course Series',
          description: 'Produced learning modules on AR/VR, AI, Blockchain, reaching 300+ learners.',
        },
        {
          title: 'Micro Learning Modules',
          description: 'Pioneered bite-sized learning that increased completion rates by 45%.',
        },
      ],
    },
  },
  {
    id: 'experience-3',
    title: 'Agility (2018)',
    icon: '🚛',
    worldX: 1600,
    infoCard: { period: '2018 — 2022', company: 'Agility Logistics', position: 'Senior Fleet Development', division: 'Fleet Operations' },
    content: {
      heading: 'Senior Fleet Development',
      subtitle: 'Agility Logistics — Fleet Operations (Dec 2018 — Jun 2022)',
      items: [
        {
          title: 'Road Freight Optimization',
          description: 'Redesigned route planning, improving delivery efficiency by 25%.',
        },
        {
          title: 'GPS Monitoring System',
          description: 'Real-time vehicle tracking, reducing unauthorized usage by 30%.',
        },
        {
          title: 'Fuel Data Pipeline (SSIS/ETL)',
          description: 'Processing 10,000+ daily fuel records with 99.5% accuracy.',
        },
      ],
    },
  },
  {
    id: 'experience-4',
    title: 'DSV',
    icon: '🏢',
    worldX: 2000,
    infoCard: { period: '2022 — 2025', company: 'DSV Air and Sea', position: 'Product Dev Specialist', division: 'Road Freight Product' },
    content: {
      heading: 'Product Development Specialist',
      subtitle: 'DSV Air and Sea — Road Freight (Jul 2022 — Sep 2025)',
      items: [
        {
          title: 'B2C Shipment Platform',
          description: 'End-to-end booking system with LINE notifications, serving 300+ monthly shipments, reducing inquiries by 40%.',
          tags: ['ASP.NET MVC', 'LINE API', 'MSSQL'],
        },
        {
          title: 'POD Web Application',
          description: 'Digitized proof-of-delivery for 50+ drivers, cutting processing time by 60%.',
          tags: ['ASP.NET MVC', 'LINE LIFF', 'MSSQL'],
        },
        {
          title: 'HR LINE OA Chatbot + Beacon',
          description: 'Enterprise HR chatbot with Bluetooth beacon attendance tracking for 200+ employees.',
          tags: ['.NET 8', 'EF Core', 'LINE Messaging API', 'DevExtreme'],
        },
        {
          title: 'Automation Suite',
          description: 'Alcohol testing, auto POD upload, milestone reporting — reducing manual effort by 80%.',
          tags: ['OCR', 'Selenium', 'LINE OA'],
        },
      ],
    },
  },
  {
    id: 'experience-5',
    title: 'DSV OpEx',
    icon: '🔧',
    worldX: 2400,
    infoCard: { period: '2025 — Present', company: 'DSV Road', position: 'OpEx Developer', division: 'Mekong Cluster' },
    content: {
      heading: 'Operation Excellence — Developer',
      subtitle: 'DSV Road — Mekong Cluster (Sep 2025 — Present)',
      items: [
        {
          title: 'Shipment Creation Process Optimization',
          description: 'Engineered a VBA-based GUI application that streamlined shipment creation workflows, achieving 100% system adoption.',
          tags: ['Excel VBA', 'Process Optimization'],
        },
        {
          title: 'BNLC Cross-dock Improvement',
          description: 'Led cross-dock process improvement using Value Stream Mapping, implementing Takt Time and Cycle Time analysis.',
          tags: ['VSM', 'Lean', 'Time-Tracking'],
        },
      ],
    },
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: '⚡',
    worldX: 2800,
    infoCard: {
      period: '14+ Years Experience',
      company: 'C# · Python · TypeScript',
      position: 'Azure · GCP · DigitalOcean',
      division: 'MSSQL · PostgreSQL · MongoDB',
      labels: ['⏱ EXPERIENCE', '💻 LANGUAGES', '☁️ CLOUD', '🗄 DATABASES'],
    },
    content: {
      heading: 'Technical Skills',
      items: [
        {
          title: 'Backend',
          description: 'C#, ASP.NET MVC/Web API/Core (.NET 8), Python, Node.js, VB, C/C++',
        },
        {
          title: 'Frontend',
          description: 'JavaScript, TypeScript, Vue.js, HTML5, CSS3, Bootstrap, LINE LIFF',
        },
        {
          title: 'Cloud & DevOps',
          description: 'Microsoft Azure, Google Cloud, Digital Ocean, SonarQube, Azure DevOps',
        },
        {
          title: 'Data & Analytics',
          description: 'MSSQL, PostgreSQL, MySQL, MongoDB, SSIS/ETL, Power BI, Tableau',
        },
        {
          title: 'AI & Automation',
          description: 'ChatGPT, Claude, Gemini, Copilot, Cursor, OCR, Selenium, n8n, Node-RED',
        },
        {
          title: 'IoT',
          description: 'ESP32, Sensor Integration, Beacon Technology',
        },
      ],
    },
  },
  {
    id: 'certifications',
    title: 'Certs',
    icon: '📜',
    worldX: 3100,
    infoCard: {
      period: 'Google · Scrum · Data',
      company: '6 Professional Certs',
      position: 'CSM · Data Science',
      division: '2022 — 2024',
      labels: ['🏆 PROVIDERS', '📜 TOTAL CERTS', '🎯 SPECIALTIES', '📅 EARNED'],
    },
    content: {
      heading: 'Certifications',
      items: [
        { title: 'Google Cybersecurity Professional Certificate', period: '2024' },
        { title: 'Google Project Management Professional Certificate', period: '2024' },
        { title: 'Google Business Intelligence Professional Certificate', period: '2024' },
        { title: 'Road to Data Engineer 2.0', period: '2023' },
        { title: 'Certified Scrum Master (CSM)', period: '2022' },
        { title: 'Data Science Bootcamp 5', period: '2022' },
      ],
    },
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: '📬',
    worldX: 3400,
    infoCard: {
      period: 'Chayuthpong Makmontrisrisuk',
      company: '+66 63 998 9990',
      position: 'Nong Chok, Bangkok, Thailand',
      division: 'chayuthpong.makmontrisrisuk@hotmail.com',
      labels: ['👤 NAME', '📱 PHONE', '📍 LOCATION', '📧 EMAIL'],
    },
    content: {
      heading: 'Get in Touch',
      items: [
        {
          title: 'Chayuthpong Makmontrisrisuk',
          description: 'Bangkok, Thailand',
          bullets: [
            '📧 chayuthpong.makmontrisrisuk@hotmail.com',
            '📱 +66 63 998 9990',
            '🌐 aitms.founder@gmail.com',
          ],
        },
      ],
    },
  },
];
