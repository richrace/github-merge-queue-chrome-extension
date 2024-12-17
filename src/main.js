const content = (link) =>
  "<a " +
  'id="merge-queue-tab" ' +
  `href="${link}" ` +
  'class="UnderlineNav-item no-wrap js-responsive-underlinenav-item js-selected-navigation-item"> ' +
  '<svg aria-hidden="true" height="16" viewBox="0 0 24 24" version="1.1" width="16" data-view-component="true" class="octicon octicon-merge-queue UnderlineNav-octicon d-none d-sm-inline"> ' +
  '<path d="M5.75 6.5a1.75 1.75 0 1 1 .001-3.501A1.75 1.75 0 0 1 5.75 6.5ZM9.5 8.75a1.75 1.75 0 1 1 3.501.001A1.75 1.75 0 0 1 9.5 8.75ZM5.75 22.5a3.25 3.25 0 0 1-.745-6.414A.81.81 0 0 1 5 16v-5a.75.75 0 0 1 1.5 0v5a.81.81 0 0 1-.005.086A3.252 3.252 0 0 1 5.75 22.5ZM4 19.25a1.75 1.75 0 1 0 3.501-.001A1.75 1.75 0 0 0 4 19.25Zm11-6.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Zm3.25 1.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z">' +
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
