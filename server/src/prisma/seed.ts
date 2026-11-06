import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATALOG_ITEMS = [
  {
    code: 'ENG-FE-REACT',
    name: 'Frontend Web App Development (React/Next.js)',
    category: 'Engineering',
    description: 'High-performance, responsive UI engineering using React/Next.js, Tailwind CSS, and state management.',
    unitType: 'hour',
    defaultRate: 95.0,
    keywords: 'frontend, react, nextjs, web app, ui, portal, user interface, web development, dashboard, client app',
  },
  {
    code: 'ENG-BE-NODE',
    name: 'Backend API & Microservices Development',
    category: 'Engineering',
    description: 'Scalable RESTful / GraphQL API services built with Node.js/Python, database ORM, and secure authentication.',
    unitType: 'hour',
    defaultRate: 110.0,
    keywords: 'backend, api, node, python, database, rest, microservices, server, authentication, endpoint, integration',
  },
  {
    code: 'ENG-MOB-FLUT',
    name: 'Mobile Application Development (iOS & Android)',
    category: 'Engineering',
    description: 'Cross-platform mobile application engineering with native hardware feature access and offline support.',
    unitType: 'hour',
    defaultRate: 120.0,
    keywords: 'mobile, ios, android, app, flutter, react native, phone app, app store',
  },
  {
    code: 'ENG-FULLSTACK-MVP',
    name: 'Full-Stack MVP Delivery Package',
    category: 'Engineering',
    description: 'End-to-end MVP build encompassing frontend, backend, database, and foundational analytics.',
    unitType: 'milestone',
    defaultRate: 8500.0,
    keywords: 'mvp, fullstack, end-to-end, prototype, complete app, turnkey',
  },
  {
    code: 'DES-UIUX-PRO',
    name: 'Comprehensive UI/UX Design & User Research',
    category: 'Design',
    description: 'User personas, interactive wireframes, clickable Figma prototypes, and responsive design layouts.',
    unitType: 'hour',
    defaultRate: 85.0,
    keywords: 'design, ui, ux, wireframe, figma, prototype, mockup, styling, graphics',
  },
  {
    code: 'DES-DESIGN-SYS',
    name: 'Enterprise Design System & Brand Guidelines',
    category: 'Design',
    description: 'Component library tokens, color palettes, typography standards, and brand identity assets.',
    unitType: 'milestone',
    defaultRate: 3500.0,
    keywords: 'design system, component library, branding, style guide, tokens',
  },
  {
    code: 'OPS-CLOUD-ARCH',
    name: 'Cloud Infrastructure & Server Architecture (AWS/GCP)',
    category: 'Cloud & DevOps',
    description: 'Secure, high-availability cloud architecture setup, VPC, load balancing, serverless, and database clustering.',
    unitType: 'hour',
    defaultRate: 130.0,
    keywords: 'cloud, aws, gcp, azure, infrastructure, devops, hosting, server, terraform',
  },
  {
    code: 'OPS-CI-CD',
    name: 'CI/CD Automated Deployment Pipeline',
    category: 'Cloud & DevOps',
    description: 'GitHub Actions / GitLab CI automated build, test, and zero-downtime deployment workflows.',
    unitType: 'milestone',
    defaultRate: 2500.0,
    keywords: 'ci/cd, pipeline, deployment, github actions, automated deploy, continuous integration',
  },
  {
    code: 'QA-E2E-TEST',
    name: 'Automated QA & E2E Testing Suite',
    category: 'Quality Assurance',
    description: 'Comprehensive test coverage including unit testing, integration tests, and Playwright/Cypress end-to-end flows.',
    unitType: 'hour',
    defaultRate: 75.0,
    keywords: 'qa, testing, quality assurance, automation, test suite, bugs, verification, cypress',
  },
  {
    code: 'SEC-AUDIT',
    name: 'Security Audit & Vulnerability Assessment',
    category: 'Security',
    description: 'OWASP top 10 compliance audit, vulnerability scanning, penetration testing, and code review report.',
    unitType: 'milestone',
    defaultRate: 4200.0,
    keywords: 'security, audit, pentest, vulnerability, compliance, owasp, penetration test',
  },
  {
    code: 'SUP-SLA-MONTH',
    name: 'Monthly Managed Support & Maintenance SLA',
    category: 'Maintenance',
    description: '24/7 uptime monitoring, critical bug patches, dependency updates, and dedicated 4-hour response SLA.',
    unitType: 'month',
    defaultRate: 1500.0,
    keywords: 'maintenance, support, retainer, monthly, sla, bug fixes, updates',
  },
  {
    code: 'AI-INTEG-LLM',
    name: 'AI & LLM Integration Module',
    category: 'Engineering',
    description: 'Custom LLM prompt engineering, RAG pipeline, embeddings, vector database, and agentic workflows.',
    unitType: 'hour',
    defaultRate: 140.0,
    keywords: 'ai, llm, gemini, openai, chat, rag, embeddings, vector, machine learning, artificial intelligence, automation',
  }
];

export async function seedCatalog() {
  console.log('Seeding Pricing Catalog...');
  for (const item of CATALOG_ITEMS) {
    await prisma.catalogItem.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }
  console.log(`Successfully seeded ${CATALOG_ITEMS.length} pricing catalogue items.`);
}

if (process.argv[1] && process.argv[1].includes('seed.ts')) {
  seedCatalog()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
