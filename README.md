# HNG13 STAGE 2 Task (Backend)

## Country Currency and Exchange REST API

## Overview
This is a Nodejs/Express API. This application is built to fetch and manage country data incuding currency exchange.

## Getting Started

### Installation

To get this project up and running locally, follow these steps:

**Clone the Repository:**
```bash
git clone https://github.com/Frank-dev20/currency_converter.git
cd country-currency-api
```

**Install Dependencies:**

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and populate it with the following required environment variables:
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=country_data_db

COUNTRIES_API_URL='https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
EXCHANGE_RATE_API_URL='https://open.er-api.com/v6/latest/USD'

API_TIMEOUT=10000

IMAGE_CACHE_PATH=./cache/summary.png
```

**Start the Server**:

```bash
    node server.js
```