const request = require('./tools/request');

(async () => {
  try {
    const html = await request.getRecipeByID('23-bolo-de-cenoura');
    const fs = require('fs');
    fs.writeFileSync('/tmp/recipe.html', html);
    console.log('Saved recipe HTML to /tmp/recipe.html');
    console.log('Length:', html.length);
    
    // Check for h1
    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    const h1s = doc.querySelectorAll('h1');
    console.log('Found', h1s.length, 'h1 elements');
    h1s.forEach((h1, i) => console.log('H1', i, ':', h1.textContent.trim().substring(0, 50)));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
})();