const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

async function getAllCountries(filters = {}) {
  try {
    let query = 'SELECT * FROM countries WHERE 1=1';
    const params = [];
   
    if (filters.region) {
      query += ' AND region = ?';
      params.push(filters.region);
    }
    
    if (filters.currency) {
      query += ' AND currency_code = ?';
      params.push(filters.currency);
    }
    
    if (filters.sort === 'gdp_desc') {
      query += ' ORDER BY estimated_gdp DESC';
    } else if (filters.sort === 'gdp_asc') {
      query += ' ORDER BY estimated_gdp ASC';
    } else if (filters.sort === 'population_desc') {
      query += ' ORDER BY population DESC';
    } else if (filters.sort === 'population_asc') {
      query += ' ORDER BY population ASC';
    } else {
      query += ' ORDER BY name ASC'; 
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error getting all countries:', error);
    throw error;
  }
}

async function getCountryByName(name) {
  try {
    const query = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?) LIMIT 1';
    const [rows] = await pool.execute(query, [name]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting country by name:', error);
    throw error;
  }
}

async function upsertCountry(countryData) {
  try {
    const query = `
      INSERT INTO countries (
        name, capital, region, population, currency_code, 
        exchange_rate, estimated_gdp, flag_url, last_refreshed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        capital = VALUES(capital),
        region = VALUES(region),
        population = VALUES(population),
        currency_code = VALUES(currency_code),
        exchange_rate = VALUES(exchange_rate),
        estimated_gdp = VALUES(estimated_gdp),
        flag_url = VALUES(flag_url),
        last_refreshed_at = NOW()
    `;
    
    const params = [
      countryData.name,
      countryData.capital,
      countryData.region,
      countryData.population,
      countryData.currency_code,
      countryData.exchange_rate,
      countryData.estimated_gdp,
      countryData.flag_url
    ];
    
    const [result] = await pool.execute(query, params);
    return result;
  } catch (error) {
    console.error('Error upserting country:', error);
    throw error;
  }
}

async function deleteCountryByName(name) {
  try {
    const query = 'DELETE FROM countries WHERE LOWER(name) = LOWER(?)';
    const [result] = await pool.execute(query, [name]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting country:', error);
    throw error;
  }
}

async function getCountryCount() {
  try {
    const query = 'SELECT COUNT(*) as count FROM countries';
    const [rows] = await pool.execute(query);
    return rows[0].count;
  } catch (error) {
    console.error('Error getting country count:', error);
    throw error;
  }
}

async function updateRefreshStatus(totalCountries) {
  try {
    const query = `
      UPDATE refresh_status 
      SET last_refreshed_at = NOW(), total_countries = ? 
      WHERE id = 1
    `;
    await pool.execute(query, [totalCountries]);
  } catch (error) {
    console.error('Error updating refresh status:', error);
    throw error;
  }
}

async function getRefreshStatus() {
  try {
    const query = 'SELECT * FROM refresh_status WHERE id = 1';
    const [rows] = await pool.execute(query);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting refresh status:', error);
    throw error;
  }
}

async function getTopCountriesByGDP(limit = 5) {
  try {
    const safeLimit = Number(limit);

    const query = `
      SELECT name, estimated_gdp 
      FROM countries 
      WHERE estimated_gdp IS NOT NULL 
      ORDER BY estimated_gdp DESC 
      LIMIT ${safeLimit}
    `;
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  } catch (error) {
    console.error('Error getting top countries:', error);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  getAllCountries,
  getCountryByName,
  upsertCountry,
  deleteCountryByName,
  getCountryCount,
  updateRefreshStatus,
  getRefreshStatus,
  getTopCountriesByGDP
};

