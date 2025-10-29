const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const countriesRouter = require('./routes/countries');
const countriesController = require('../country-currency-api/controller/countriesCountroller'); 

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/countries', countriesRouter);

app.get('/status', countriesController.getStatus); 

app.get('/', (req, res) => {
  res.json({
    message: 'Country Data API',
    version: '1.0.0',
    endpoints: {
      'POST /countries/refresh': 'Refresh country data from external APIs',
      'GET /countries': 'Get all countries (supports ?region=, ?currency=, ?sort=)',
      'GET /countries/:name': 'Get a specific country',
      'DELETE /countries/:name': 'Delete a country',
      'GET /status': 'Get refresh status',
      'GET /countries/image': 'Get Summary Image'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
});

module.exports = app;