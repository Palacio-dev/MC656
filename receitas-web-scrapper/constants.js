module.exports = {
  tg_base_url: 'https://www.tudogostoso.com.br',
  max_recipes_returned: 5, // Reduced from 10 to 5 for faster responses

  errors: {
    recipes_search_not_found: { code: 400, message: 'no recipes found' },
    get_recipe_not_found: { code: 400, message: 'recipe not found' },
  },
};
