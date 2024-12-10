const content = (link) =>
  "<a " +
  'id="merge-queue-tab" ' +
  `href="${link}" ` +
  'class="UnderlineNav-item no-wrap js-responsive-underlinenav-item js-selected-navigation-item"> ' +
  '<svg aria-hidden="true" height="16" viewBox="0 0 448 512" version="1.1" width="16" data-view-component="true" class="octicon octicon-graph UnderlineNav-octicon d-none d-sm-inline"> ' +
  '<!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M80 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm32.4 97.2c28-12.4 47.6-40.5 47.6-73.2c0-44.2-35.8-80-80-80S0 35.8 0 80c0 32.8 19.7 61 48 73.3l0 205.3C19.7 371 0 399.2 0 432c0 44.2 35.8 80 80 80s80-35.8 80-80c0-32.8-19.7-61-48-73.3l0-86.6c26.7 20.1 60 32 96 32l86.7 0c12.3 28.3 40.5 48 73.3 48c44.2 0 80-35.8 80-80s-35.8-80-80-80c-32.8 0-61 19.7-73.3 48L208 240c-49.9 0-91-38.1-95.6-86.8zM80 408a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM344 272a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/> ' +
  "</svg> " +
  '<span data-content="Merge Queue">Merge Queue</span> ' +
  '<span id="merge-queue-tab-count" data-pjax-replace="" data-turbo-replace="" title="Not available" data-view-component="true" class="Counter"></span> ' +
  "</a>";

const appendLi = (link) => {
  // Don't add another `li` if not needed
  if (document.querySelector("#merge-queue-tab")) {
    return;
  }

  const li = document.createElement("li");

  li.className = "d-inline-flex";
  li.innerHTML = content(link);

  document.querySelector(".UnderlineNav-body").appendChild(li);
};

// Used for caching
let prevRepo;
let success = false;

// We test the current URL to see if the repo has a merge queue by seeing if the endpoint exists
const testCurrentUrl = async (previousRepo) => {
  const url = window.location.href;
  const repo = url.split("/").slice(0, 5).join("/");
  const link = repo + "/queue/main";

  // If we haven't changed repos we don't want to another fetch
  if (previousRepo && previousRepo === repo) {
    if (success) {
      appendLi(link);
    }
    return;
  }

  // See if the merge queue exists
  fetch(link, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        success = true;
        appendLi(link);
        return;
      }

      return Promise.reject(response);
    })
    .catch(() => {
      success = false;
    });

  // Cache the previous repo
  prevRepo = repo;
};

// Seeing if anything on the page has changed. GitHub doesn't do page loads mostly (built in Rails with turbo).
const addLocationObserver = (callback) => {
  const config = { attributes: false, childList: true, subtree: false };
  const observer = new MutationObserver(callback);

  observer.observe(document.body, config);
};

const observerCallback = () => {
  // It should only run on GitHub
  if (window.location.href.startsWith("https://github.com")) {
    testCurrentUrl(prevRepo);
  }
};

addLocationObserver(observerCallback);
observerCallback();
