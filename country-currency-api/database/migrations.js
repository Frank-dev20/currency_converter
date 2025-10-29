const db = require('./db');

/**
 * Creates database tables if they don't exist
 * Railway-compatible SQL (no ON DUPLICATE KEY in INSERT)
 */
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Create countries table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(100),
        population BIGINT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(15, 6),
        estimated_gdp DECIMAL(20, 2),
        flag_url TEXT,
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_name (name),
        INDEX idx_region (region),
        INDEX idx_currency (currency_code)
      )
    `);
    
    console.log('Countries table ready');
    
    // Create refresh_status table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_status (
        id INT PRIMARY KEY DEFAULT 1,
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_countries INT DEFAULT 0,
        CHECK (id = 1)
      )
    `);
    
    console.log('Refresh status table ready');
    
    // Check if refresh_status has data, if not insert initial record
    const [rows] = await db.pool.query('SELECT COUNT(*) as count FROM refresh_status');
    
    if (rows[0].count === 0) {
      await db.pool.query(`
        INSERT INTO refresh_status (id, last_refreshed_at, total_countries)
        VALUES (1, CURRENT_TIMESTAMP, 0)
      `);
      console.log('Refresh status initialized');
    }
    
    console.log('Database migrations completed successfully\n');
    return true;
    
  } catch (error) {
    console.error('Database migration failed:', error.message);
    throw error;
  }
}

module.exports = { runMigrations };