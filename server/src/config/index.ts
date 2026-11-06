import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    imapHost: process.env.IMAP_HOST || 'imap.gmail.com',
    imapPort: parseInt(process.env.IMAP_PORT || '993', 10),
  },

  company: {
    name: process.env.COMPANY_NAME || 'PropFlow Solutions Inc.',
    email: process.env.COMPANY_EMAIL || 'proposals@propflow.ai',
    phone: process.env.COMPANY_PHONE || '+1 (555) 392-8012',
    address: process.env.COMPANY_ADDRESS || '450 Market Street, Suite 800, San Francisco, CA',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
