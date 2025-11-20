// Simple Node.js test script for Recipe API
// Run with: node test-api.js

const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Testing: http://localhost:3000${path}`);
    console.log('⏳ Waiting for response (this may take a while - web scraping)...\n');
    
    const startTime = Date.now();
    
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`✅ Response received in ${duration}s`);
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📦 Data length: ${data.length} characters\n`);
        
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse JSON: ' + e.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // 60 second timeout for web scraping
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout after 60s'));
    });
  });
}

async function runTests() {
  console.log('🧪 Recipe API Test Suite\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // Test 1: Search
    console.log('📝 Test 1: Search for "bolo"');
    const searchResults = await testAPI('/search/bolo');
    
    console.log(`📋 Results:`);
    console.log(`   Found ${searchResults.length} recipes\n`);
    
    if (searchResults.length > 0) {
      console.log('   First 3 recipes:');
      searchResults.slice(0, 3).forEach((recipe, idx) => {
        console.log(`   ${idx + 1}. ${recipe.title}`);
        console.log(`      ID: ${recipe.id}`);
      });
      console.log('');
      
      // Test 2: Get recipe details
      const firstRecipe = searchResults[0];
      console.log('=' .repeat(50) + '\n');
      console.log(`📝 Test 2: Get details for "${firstRecipe.title}"`);
      const recipeDetails = await testAPI(`/recipe/${firstRecipe.id}`);
      
      console.log(`📖 Recipe Details:`);
      console.log(`   Title: ${recipeDetails.title}`);
      console.log(`   Prep time: ${recipeDetails.stats.prepare_time_minutes} minutes`);
      console.log(`   Portions: ${recipeDetails.stats.portion_output}`);
      console.log(`   Favorites: ${recipeDetails.stats.favorites}`);
      console.log(`   Ingredients sections: ${recipeDetails.ingredients.length}`);
      console.log(`   Instructions sections: ${recipeDetails.instructions.length}`);
      
      // Show first few ingredients
      if (recipeDetails.ingredients.length > 0) {
        console.log(`\n   📝 First ingredients section:`);
        const firstSection = recipeDetails.ingredients[0];
        if (firstSection.title !== 'default') {
          console.log(`      Section: ${firstSection.title}`);
        }
        firstSection.items.slice(0, 3).forEach((item, idx) => {
          console.log(`      ${idx + 1}. ${item}`);
        });
        if (firstSection.items.length > 3) {
          console.log(`      ... and ${firstSection.items.length - 3} more`);
        }
      }
      
      // Show first instruction
      if (recipeDetails.instructions.length > 0) {
        console.log(`\n   📖 First instruction step:`);
        const firstInstruction = recipeDetails.instructions[0];
        console.log(`      1. ${firstInstruction.items[0]}`);
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✨ All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
