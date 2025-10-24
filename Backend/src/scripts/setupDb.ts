import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = (password: string) => {
  try {
    // Read the example env file
    const envExample = fs.readFileSync(path.join(__dirname, '../../.env.example'), 'utf8');
    
    // Replace the placeholder with actual password
    const envContent = envExample.replace('<db_password>', password);
    
    // Write to .env file
    fs.writeFileSync(path.join(__dirname, '../../.env'), envContent);
    
    console.log('Successfully created .env file with database configuration');
  } catch (error) {
    console.error('Error setting up database configuration:', error);
    process.exit(1);
  }
};

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Please provide the database password as an argument');
  console.log('Usage: pnpm run db:setup <password>');
  process.exit(1);
}

setupDatabase(password);
