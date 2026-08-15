import { MongoMemoryServer } from 'mongodb-memory-server';

async function main() {
  console.log("Starting Standalone MongoMemoryServer instance on port 27017...");
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'iiuc_cover_page',
      },
    });
    console.log(`✓ Standalone MongoDB Server process started successfully!`);
    console.log(`✓ Listening at URI: ${mongod.getUri()}`);
    console.log(`✓ Port: 27017`);
    console.log(`✓ Database: iiuc_cover_page`);
    console.log(`✓ Collection: teachers`);
    console.log("\nServer is running. Press Ctrl+C to stop.");
  } catch (err) {
    console.error("❌ Failed to start MongoMemoryServer:", err.message);
  }
}

main();
