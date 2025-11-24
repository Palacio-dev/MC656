const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto('https://www.tudogostoso.com.br/busca?search=bolo', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const content = await page.content();
  const fs = require('fs');
  fs.writeFileSync('/tmp/tudogostoso.html', content);
  
  console.log('HTML saved to /tmp/tudogostoso.html');
  console.log('Length:', content.length);
  
  await browser.close();
})();