require('dotenv').config();
const app = require('./app');
const db = require('./database/db');
const { runMigrations } = require('./database/migrations'); 

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
   
    console.log('🔌 Testing database connection...');
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    await runMigrations(); 
    
    const server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}/`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        db.pool.end();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('\n SIGINT received (Ctrl+C), shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        db.pool.end();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();