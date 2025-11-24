/* eslint-disable no-param-reassign */
const scrapper = require('./tools/scrapper');
const request = require('./tools/request');

module.exports = {
  async search(searchStr) {
    searchStr = searchStr.replace(/ /g, '+');
    let res;
    console.log('Service: searching for', searchStr);
    await request.searchRecipes(searchStr)
      .then((resp) => {
        console.log('Service: received HTML, length:', resp ? resp.length : 0);
        res = scrapper.parseRecipesList(resp);
        console.log('Service: parsed results:', res);
      })
      .catch((err) => {
        console.error('Service: error', err);
        return err;
      });
    return res;
  },
  async get_recipe(id) {
    let res;
    console.log('Service: getting recipe', id);
    await request.getRecipeByID(id)
      .then((resp) => {
        console.log('Service: received HTML for recipe, length:', resp ? resp.length : 0);
        res = scrapper.parseRecipe(resp);
        console.log('Service: parsed recipe:', res ? 'success' : 'undefined');
      })
      .catch((err) => {
        console.error('Service: error getting recipe', err);
        return err;
      });
    return res;
  },
};
