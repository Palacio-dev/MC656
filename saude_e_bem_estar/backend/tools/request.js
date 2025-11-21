/* eslint-disable no-return-assign */
/* eslint-disable global-require */
const puppeteer = require('puppeteer');
const constants = require('../constants');

async function request(url) {
  // Create a fresh browser for each request to avoid Cloudflare detection
  const browserInstance = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });
  
  const page = await browserInstance.newPage();
  
  try {
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',  // Wait for DOM to be loaded
      timeout: 60000
    });
    
    // Wait for dynamic content to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the page content
    const content = await page.content();
    
    await page.close();
    await browserInstance.close();
    return content;
  } catch (error) {
    await page.close();
    await browserInstance.close();
    throw error;
  }
}

module.exports = {
  searchRecipes(searchStr) {
    const url = `${constants.tg_base_url}/busca?search=${searchStr}`;
    return request(url);
  },
  getRecipeByID(id) {
    const url = `${constants.tg_base_url}/receita/${id}.html`;
    return request(url);
  }
};
