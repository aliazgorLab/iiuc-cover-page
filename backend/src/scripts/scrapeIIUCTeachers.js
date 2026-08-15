import mongoose from 'mongoose';
import dns from 'dns';
import { connectDB } from '../config/database.js';
import { runIIUCFacultyImport } from '../services/iiucScraperService.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const main = async () => {
  try {
    await connectDB();

    const report = await runIIUCFacultyImport('CLI Scrape Script');
    console.log('\nFinal Import Summary Report:', JSON.stringify(report, null, 2));

    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Fatal Scraper Script Error:', error);
    process.exit(1);
  }
};

main();
