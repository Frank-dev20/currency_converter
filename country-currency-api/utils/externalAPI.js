const axios = require('axios')
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const COUNTRIES_API_URL = process.env.COUNTRIES_API_URL;
const EXCHANGE_RATE_API_URL = process.env.EXCHANGE_RATE_API_URL;
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 10000;


async function fetchCountries() {
  try {
    console.log('Fetching countries from Countries REST API...');
    
    const response = await axios.get(COUNTRIES_API_URL, {
      timeout: API_TIMEOUT
    });
    
    console.log(`Fetched ${response.data.length} countries`);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: REST Countries API took too long to respond');
    }
    
    if (error.response) {
      throw new Error(`REST Countries API error: ${error.response.status} ${error.response.statusText}`);
    }
    
    if (error.request) {
      throw new Error('Network error: Could not reach REST Countries API');
    }
    
    throw new Error(`Failed to fetch countries: ${error.message}`);
  }
}

async function fetchExchangeRates() {
  try {
    console.log('Fetching exchange rates from Exchange Rate API...');
    
    const response = await axios.get(EXCHANGE_RATE_API_URL, {
      timeout: API_TIMEOUT
    });
    
    console.log(`Fetched exchange rates for ${Object.keys(response.data.rates).length} currencies`);
    return response.data.rates;
    
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: Exchange Rate API took too long to respond');
    }
    
    if (error.response) {
      throw new Error(`Exchange Rate API error: ${error.response.status} ${error.response.statusText}`);
    }
    
    if (error.request) {
      throw new Error('Network error: Could not reach Exchange Rate API');
    }
    
    throw new Error(`Failed to fetch exchange rates: ${error.message}`);
  }
}


function processCountryData(countries, exchangeRates) {
  console.log('Processing country data...');
  
  const processedCountries = countries.map(country => {
 
    let currencyCode = null;
    let exchangeRate = null;
    let estimatedGdp = null;
    
    if (country.currencies && country.currencies.length > 0) {
      currencyCode = country.currencies[0].code;
      
      if (currencyCode && exchangeRates[currencyCode]) {
        exchangeRate = exchangeRates[currencyCode];
        
        const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
        estimatedGdp = (country.population * randomMultiplier) / exchangeRate;
      }
    }
  
    return {
      name: country.name,
      capital: country.capital || null,
      region: country.region || null,
      population: country.population,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      estimated_gdp: estimatedGdp ? parseFloat(estimatedGdp.toFixed(2)) : null,
      flag_url: country.flag || null
    };
  });
  
  console.log(`Processed ${processedCountries.length} countries`);
  return processedCountries;
}

async function fetchAndProcessData() {
  try {
    console.log('\n Start fetching data from external APIs...\n');
   
    const [countries, exchangeRates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);
    
    const processedCountries = processCountryData(countries, exchangeRates);
    
    console.log('\n Data fetch and processing complete!\n');
    
    return {
      countries: processedCountries,
      totalCount: processedCountries.length
    };
    
  } catch (error) {
    console.error('\n Failed to fetch and process data\n');
    throw error;
  }
}



module.exports = {
  fetchCountries,
  fetchExchangeRates,
  processCountryData,
  fetchAndProcessData
};