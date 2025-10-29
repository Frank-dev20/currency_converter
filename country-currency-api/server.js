require('dotenv').config();
const app = require('./app');
const db = require('./database/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port http://localhost:${PORT}`);
    });
    process.on('SIGTERM', () => {
      console.log('\n SIGTERM received, shutting down gracefully...');
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