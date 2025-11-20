/* eslint-disable prefer-destructuring */
/* eslint-disable no-cond-assign */
const jsdom = require('jsdom');

const { JSDOM } = jsdom;
const constants = require('../constants');

function extractRecipeID(link) {
  const regex = /\/receita\/(\S+).html/gm;
  let m; let recipeId;
  while ((m = regex.exec(link)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }

    if (m.length > 1) {
      recipeId = m[1];
    }
  }
  return recipeId;
}

function parseItems(title, element, identifier) {
  const section = { title, items: [] };
  let items = element.querySelectorAll(identifier);
  if (items.length === 0) {
    items = element.nextElementSibling.querySelectorAll(identifier);
  }
  items.forEach((item) => {
    if (item != null) { section.items = section.items.concat(item.textContent); }
  });
  return section;
}

function extractIngredients(doc) {
  const ingredientSections = [];
  const container = doc.querySelector('.recipe-section.recipe-ingredients');
  if (!container) {
    // fallback: collect any labels found on the page
    const fallback = { title: 'Ingredientes', items: [] };
    const ingredientLabels = doc.querySelectorAll('.recipe-ingredients-item-label');
    ingredientLabels.forEach((label) => {
      if (label && label.textContent) fallback.items.push(label.textContent.trim());
    });
    if (fallback.items.length) ingredientSections.push(fallback);
    return ingredientSections;
  }

  // Iterate over relevant nodes in order and build sections when subtitles appear
  const nodes = container.querySelectorAll('.recipe-ingredients-subtitle, .recipe-ingredients-item-wrapper');
  let current = { title: 'Ingredientes', items: [] };
  nodes.forEach((node) => {
    if (node.classList && node.classList.contains('recipe-ingredients-subtitle')) {
      // start a new section
      // push previous if it has items
      if (current.items && current.items.length) ingredientSections.push(current);
      current = { title: node.textContent.trim(), items: [] };
      return;
    }

    if (node.classList && node.classList.contains('recipe-ingredients-item-wrapper')) {
      const label = node.querySelector('.recipe-ingredients-item-label');
      if (label && label.textContent) current.items.push(label.textContent.trim());
    }
  });

  if (current.items && current.items.length) ingredientSections.push(current);
  return ingredientSections;
  
  // New structure: .recipe-ingredients-item-label
  const ingredientLabels = doc.querySelectorAll('.recipe-ingredients-item-label');
  ingredientLabels.forEach((label) => {
    if (label && label.textContent) {
      section.items.push(label.textContent.trim());
    }
  });
  
  if (section.items.length > 0) {
    ingredientSections.push(section);
  }
  
  return ingredientSections;
}

function extractInstructions(doc) {
  const instructionsSections = [];
  
  // Iterate through recipe-steps-item elements to maintain order and detect subsections
  const stepItems = doc.querySelectorAll('.recipe-steps-item');
  let currentSection = { title: 'Modo de Preparo', items: [] };
  
  stepItems.forEach((stepItem) => {
    // Check if this step has a title (subsection like "Massa" or "Cobertura")
    const titleElement = stepItem.querySelector('.recipe-steps-title');
    if (titleElement && titleElement.textContent.trim()) {
      // Save previous section if it has items
      if (currentSection.items.length > 0) {
        instructionsSections.push(currentSection);
      }
      // Start new section with the title
      currentSection = { title: titleElement.textContent.trim(), items: [] };
    }
    
    // Extract the step text
    const stepText = stepItem.querySelector('.recipe-steps-text');
    if (stepText && stepText.textContent) {
      const text = stepText.textContent.trim();
      if (text) {
        currentSection.items.push(text);
      }
    }
  });
  
  // Don't forget the last section
  if (currentSection.items.length > 0) {
    instructionsSections.push(currentSection);
  }
  
  return instructionsSections;
}

function extractStats(doc) {
  const ret = {};

  // Try to extract from JSON-LD structured data
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Recipe') {
        // Extract prep time (format: PT40M)
        if (data.prepTime) {
          const timeMatch = data.prepTime.match(/PT(\d+)M/);
          if (timeMatch) {
            ret.prepare_time_minutes = Number(timeMatch[1]);
          }
        }
        
        // Extract yield/portions
        if (data.recipeYield) {
          const yieldMatch = data.recipeYield.match(/(\d+)/);
          if (yieldMatch) {
            ret.portion_output = Number(yieldMatch[1]);
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });
  
  // Try to parse JSON-LD structured data for more reliable stats
  try {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i += 1) {
      const txt = scripts[i].textContent;
      if (!txt) continue;
      let parsed = null;
      try {
        parsed = JSON.parse(txt);
      } catch (e) {
        // sometimes the JSON-LD contains multiple objects; try to extract the first JSON object
        const m = txt.match(/\{[\s\S]*\}/);
        if (m) {
          try { parsed = JSON.parse(m[0]); } catch (ee) { parsed = null; }
        }
      }

      if (!parsed) continue;

      // parsed can be an array
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const cand of candidates) {
        if (cand['@type'] === 'Recipe' || (cand['@type'] && cand['@type'].toLowerCase && cand['@type'].toLowerCase() === 'recipe')) {
          // prepTime like PT40M
          if (cand.prepTime) {
            const match = cand.prepTime.match(/PT(\d+)M/);
            if (match) ret.prepare_time_minutes = Number(match[1]);
          }
          if (cand.recipeYield) {
            // try to extract a number from recipeYield
            const yMatch = String(cand.recipeYield).match(/(\d+)/);
            if (yMatch) ret.portion_output = Number(yMatch[1]);
          }
        }
      }
    }
  } catch (err) {
    // ignore JSON-LD parsing errors
  }

  return ret;
}

function extractTitle(doc) {
  // Try multiple selectors for the title
  const selectors = [
    'div.recipe-title h1',
    '.recipe-title h1',
    'h1.recipe-title',
    'article h1',
    'h1'
  ];
  
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim().replace(/\n/g, ' ');
    }
  }
  
  return 'Untitled Recipe';
}

module.exports = {
  parseRecipesList(str) {
    const dom = new JSDOM(str);
    const doc = dom.window.document;

    if (doc.querySelectorAll('.no-results').length > 0) {
      return new Promise((resolve, reject) => {
        reject(constants.errors.recipes_search_not_found);
      });
    }

    const recipes = doc.querySelectorAll('.card-recipe');
    const maxRecipes = Math.min(recipes.length, constants.max_recipes_returned);
    let retRecipes = [];
    for (let i = 0; i < maxRecipes; i += 1) {
      const linkElement = recipes[i].querySelector('.card-link');

      if (linkElement) {
        const title = linkElement.textContent.trim();
        const link = linkElement.getAttribute('href');

        if (link) {
          retRecipes = retRecipes.concat({
            title: title.replace(/\n/g, '').trim(),
            id: extractRecipeID(link),
          });
        }
      }
    }
    return retRecipes;
  },
  parseRecipe(str) {
    const dom = new JSDOM(str);
    const doc = dom.window.document;

    if (doc.body.innerHTML.includes('redirected')) {
      return new Promise((resolve, reject) => { reject(constants.errors.get_recipe_not_found); });
    }

    return {
      title: extractTitle(doc),
      stats: extractStats(doc),
      ingredients: extractIngredients(doc),
      instructions: extractInstructions(doc),
    };
  },
};
