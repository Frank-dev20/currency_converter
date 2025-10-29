const db = require('../database/db');
const { fetchAndProcessData } = require('../utils/externalAPI');
const imageGenerator = require('../utils/imageGenerator');


async function refreshCountries(req, res) {
  try {
      
    const { countries, totalCount } = await fetchAndProcessData();

    let savedCount = 0;
    
    for (const country of countries) {
      try {
        await db.upsertCountry(country);
        savedCount++;
        
        if (savedCount % 50 === 0) {
          console.log(`   Progress: ${savedCount}/${totalCount} countries saved...`);
        }
      } catch (error) {
        console.error(`Failed to save ${country.name}:`, error.message);
      }
    }
    
    console.log(`Saved ${savedCount}/${totalCount} countries to database`);
    
    await db.updateRefreshStatus(savedCount);
  
    const status = await db.getRefreshStatus();

    try {
    const topCountries = await db.getTopCountriesByGDP(5);
    await imageGenerator.generateSummaryImage(
        savedCount,
        topCountries,
        status.last_refreshed_at
    );
    } catch (imageError) {
    console.error('⚠️  Failed to generate summary image:', imageError.message);
    }

    console.log('Refresh complete!\n');
    
    return res.status(200).json({
      message: 'Countries refreshed successfully',
      total_countries: savedCount,
      last_refreshed_at: status.last_refreshed_at
    });
    
  } catch (error) {
    console.error('Refresh failed:', error.message);
    
    if (error.message.includes('REST Countries API') || error.message.includes('Exchange Rate API')) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: error.message
      });
    }
   
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function getAllCountries(req, res) {
  try {
    const filters = {
      region: req.query.region,
      currency: req.query.currency,
      sort: req.query.sort
    };
  
    const countries = await db.getAllCountries(filters);
  
    return res.status(200).json(countries);
    
  } catch (error) {
    console.error('Error getting countries:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function getCountryByName(req, res) {
  try {
    const countryName = req.params.name;
    
    const country = await db.getCountryByName(countryName);
    
    if (!country) {
      return res.status(404).json({
        error: 'Country not found'
      });
    }
  
    return res.status(200).json(country);
    
  } catch (error) {
    console.error('Error getting country:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function deleteCountry(req, res) {
  try {
    const countryName = req.params.name;
  
    const deleted = await db.deleteCountryByName(countryName);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Country not found'
      });
    }
    
    return res.status(204).send();
    
  } catch (error) {
    console.error('Error deleting country:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function getStatus(req, res) {
  try {
    const status = await db.getRefreshStatus();
    
    if (!status) {
      return res.status(200).json({
        total_countries: 0,
        last_refreshed_at: null
      });
    }
    
    return res.status(200).json({
      total_countries: status.total_countries,
      last_refreshed_at: status.last_refreshed_at
    });
    
  } catch (error) {
    console.error('Error getting status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

async function getSummaryImage(req, res) {
  try {
    const exists = await imageGenerator.imageExists();
    
    if (!exists) {
      return res.status(404).json({
        error: 'Summary image not found',
        message: 'Please run POST /countries/refresh first to generate the image'
      });
    }
   
    const imagePath = imageGenerator.getImagePath();
    
    return res.sendFile(imagePath, { root: '.' });
    
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}


module.exports = {
  refreshCountries,
  getAllCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getSummaryImage 
};