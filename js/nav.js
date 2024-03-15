"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $loginForm.hide();
  $signupForm.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/**
 * Reveals the story submit form
 * @param {*} evt the click event
 */
function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $submitForm.show();
}

$navSubmit.click(navSubmitClick);

function navFavoritesClick(e) {
  console.debug("navFavoritesClick", e);

  if (!currentUser.favorites.length) {
    alert("No stories yet added to favorites.");
    return;
  }

  hidePageComponents();
  $favoriteStoriesList.empty();
  $favoriteStoriesList.append(getFavoritesAsHTML());
  $favoriteStoriesList.show();
}

$navFavorites.click(navFavoritesClick);

function navOwnStoriesClick(e) {
  console.debug("navOwnStoriesClick", e);

  if (!currentUser.ownStories.length) {
    alert("No stories yet created.");
    return;
  }

  hidePageComponents();
  $ownStoriesList.empty();
  $ownStoriesList.append(getOwnStoriesAsHTML());
  $ownStoriesList.show();
}

$navOwn.click(navOwnStoriesClick);