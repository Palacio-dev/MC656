const express = require('express');

const app = express();
const service = require('./service');

// Root route - API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Receitas Web Scrapper API',
    version: '1.0.0',
    endpoints: {
      search: {
        method: 'GET',
        path: '/search/:title',
        example: 'http://localhost:4000/search/bolo',
        description: 'Search for recipes by title'
      },
      recipe: {
        method: 'GET',
        path: '/recipe/:id',
        example: 'http://localhost:4000/recipe/307527-bolo-de-aveia-com-cacau-no-micro-ondas',
        description: 'Get recipe details by ID'
      }
    },
    note: 'Responses may take 10-30 seconds (web scraping)'
  });
});

app.get('/search/:name', (req, res) => {
  console.log(`Searching for: ${req.params.name}`);
  service.search(req.params.name)
    .then((resp) => {
      console.log('Search result:', resp);
      if (!resp) {
        res.status(500).json({ error: 'No results returned from scraper' });
      } else {
        res.json(resp);
      }
    })
    .catch((err) => {
      console.error('Search error:', err);
      res.status(err.code || 500).json({ error: err.message || 'Unknown error' });
    });
});

app.get('/recipe/:id', (req, res) => {
  console.log(`Getting recipe: ${req.params.id}`);
  service.get_recipe(req.params.id)
    .then((resp) => {
      console.log('Recipe result:', resp ? 'success' : 'undefined');
      if (!resp) {
        res.status(500).json({ error: 'No results returned from scraper' });
      } else {
        res.json(resp);
      }
    })
    .catch((err) => {
      console.error('Recipe error:', err);
      res.status(err.code || 500).json({ error: err.message || 'Unknown error' });
    });
});

let port = process.env.PORT;
if (port == null || port === '') {
  port = 4000; // Changed from 3000 to avoid conflict with React app
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
