import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import bookmarksView from './views/bookmarksView';


// if(module.hot){
//   module.hot.accept();
// }

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    //console.log(id);

    if(!id) return;
    recipeView.renderSpinner();

    // 0. Uppdate results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1. atualizando bookmarks view
    bookmarksView.update(model.state.bookmarks);
    
    // 2. loading recipe
    await model.loadRecipe(id); 
    
    // 3. rendering recipe
    recipeView.render(model.state.recipe);
    

  } catch (err) {    
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) load search results 
    await model.loadSearchResults(query);

    // 3) render results
    //resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage(1));

    // 4) render pagination buttons
    paginationView.render(model.state.search);
  }catch(err){
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
      // 1) render NEW results    
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 2) render NEW pagination buttons
    paginationView.render(model.state.search);
}

const controlServings = function(newServings) {
  //update the recipe servings(state)
  model.updateServings(newServings);

  //update the recipe view      
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {

  //1. adicionar ou deletar bookamark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  
  //2. update recipeview
  recipeView.update(model.state.recipe);

  //3. render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //uplaod nova receita 
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe) 

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form
    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)

  }catch(err) {
    console.error('✨✨', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the new world');
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination); 
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
