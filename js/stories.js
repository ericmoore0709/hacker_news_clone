"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const showStar = Boolean(currentUser);
  const showDel = Boolean(currentUser);
  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        ${showStar ? getStarHTML(story) : ""}
        ${showDel ? getDelHTML(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getStarHTML(story) {
  const isFavorite = currentUser.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
    <span class="star">
      <i class="${starType} fa-star"></i>
    </span>
  `;
}

function getDelHTML(story) {
  if (currentUser.isOwnStory(story)) {
    return `
    <span class="del">
      <i class="fa fa-trash"></i>
    </span>
  `;
  }
  return "";
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function processStorySubmit(e) {
  console.debug('processStorySubmit');

  e.preventDefault();

  // collect data input
  const title = $('#submit-title').val().trim() || '';
  const url = $('#submit-url').val().trim() || '';

  // data validation
  const errors = [];
  if (!title) errors.push("Title cannot be blank.");
  if (!url) errors.push("URL cannot be blank.");

  // display errors
  if (errors.length) {
    alert(errors);
    return;
  }

  // organize input data
  const newStory = {
    title: title,
    author: currentUser.name,
    url: url
  };

  // post to API
  const story = await storyList.addStory(currentUser, newStory);

  // push story to user ownStories
  currentUser.ownStories.push(story);

  // create HTML markup for the story
  const $story = generateStoryMarkup(story);

  // prepend story to storyList 
  // because storyList.addStory() doesn't add the story to the storyList, apparently
  $allStoriesList.prepend($story);

  // empty the form
  $submitForm.trigger('reset');

  // go back to stories page
  $submitForm.hide();
  $allStoriesList.show();

}

$('#submit-form').submit(processStorySubmit);

async function toggleFavorite(e) {
  console.debug("toggleFavorite");

  const $target = $(e.target);

  // get the story from the target story id
  const storyId = $target.closest("li").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($target.hasClass("far")) {
    // story is not a favorite. Add to favorites
    await currentUser.addFavorite(story)
      .then(() => {
        $target.closest('i').toggleClass("fas far");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    // story is a favorite. Remove from favorites
    await currentUser.removeFavorite(story)
      .then(() => {
        $target.closest('i').toggleClass("fas far");

        // if looking at the favorites list, refresh the HTML list to exclude the removed favorite
        if ($target.closest('.stories-list').attr("id").includes("favorite")) {
          $target.closest('.stories-list').empty().append(getFavoritesAsHTML());
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

}

$(".stories-list").on('click', '.star', toggleFavorite);

function getFavoritesAsHTML() {
  // compile, dress, and return currentUser favorites
  return currentUser.favorites.map((s) => generateStoryMarkup(s));
}

function getOwnStoriesAsHTML() {
  // compile, dress, and return currentUser stories
  return currentUser.ownStories.map((s) => generateStoryMarkup(s));
}

async function deleteStoryClick(e) {

  console.debug('deleteStoryClick', e);

  if (!confirm('Are you sure you want to delete this story?')) return;

  // get story id and call API
  const storyId = $(e.target).closest('li').attr('id');
  const result = await storyList.deleteStory(storyId);

  if (result) {
    // if successful, remove it from our JS array as well. 
    currentUser.ownStories = currentUser.ownStories.filter((s) => s.storyId !== storyId);

    // refresh HTML list
    const $htmlList = $(e.target).closest('.stories-list');

    if ($htmlList.attr('id').includes("own")) {
      // is ownStoriesList
      $htmlList.empty().append(getOwnStoriesAsHTML());
    } else if ($htmlList.attr('id').includes("favorite")) {
      // is favoritesList (tho this really shouldn't be possible in practice)
      $htmlList.empty().append(getFavoritesAsHTML());
    } else if ($htmlList.attr('id').includes("all")) {
      // is allStoriesList
      putStoriesOnPage();
    }

  }
  else {
    alert("Deletion unsuccessful.");
  }

}

$(".stories-list").on('click', '.del', deleteStoryClick);