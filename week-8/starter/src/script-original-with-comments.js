"use strict";

const movies = [
  { title: "Inception", director: "Christopher Nolan", year: 2010, synopsis: "A thief enters dreams." },
  { title: "The Matrix", director: "The Wachowskis", year: 1999, synopsis: "Reality is not what it seems." },
  { title: "Interstellar", director: "Christopher Nolan", year: 2014, synopsis: "A journey beyond Earth." }
];

// Shared/Global Variable.
// This creates a state vulnerability. `displayMovie` could access stale or incorrect data
//  if multiple async calls overlap.
let currentMovie = null;

// This function is correctly defined as a Promise-returning function.
function fetchMovie(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const movie = movies.find(m => m.title.toLowerCase() === title.toLowerCase());
      movie ? resolve(movie) : reject("Movie not found");
    }, 800); // This fabricated delay makes it a perfect example of an async problem.
  });
}

// The listener function is marked as `async`, which is a good first step.
document.getElementById("movie-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title-input").value;

  try {
    // Improper async handling (execution order)
    // 1. `fetchMovie(title)` is called. It immediately returns a Promise that will resolve in 800ms.
    // 2. `.then()` attaches success handler, which will run when the Promise is fulfilled.
    // 3. This fetchMovie call completes right away (before the `.then()` callback executes).
    // 4. Critical issue, we are NOT using `await` here WTF. The function execution
    //    proceeds instantly to the next line.
    fetchMovie(title).then(movie => currentMovie = movie);

    // Passing stale data with poor data flow
    // `displayMovie` is called immediately after the beginning of the async operation.
    // The previous line has not finished fetching the data yet.
    // `currentMovie` is still `null` (its initial value) at this very moment.
    displayMovie(currentMovie);

    // This flow will always result in the user submitting the form, with the UI either
    // not updating or updating with old data.
    // The data fetched by the previous line will eventually assign to `currentMovie` -
    // however, it's too late for this pass.

  } catch (err) {
    // Because we are using `.then()` instead of `await`, a rejection in `fetchMovie` will
    // not be caught by this `catch` block which would only catch synchronous errors that
    // happen in the `try` block.
    showError(err);
  }
});

function displayMovie(movie) {
  // Defensive coding here is good, but in this case, it's masking the underlying problem.
  if (!movie) return;

  document.getElementById("movie-title").textContent = movie.title;
  document.getElementById("movie-director").textContent = "Director: " + movie.director;
  document.getElementById("movie-year").textContent = "Year: " + movie.year;
  document.getElementById("movie-synopsis").textContent = movie.synopsis;
  document.getElementById("movie-info").style.display = "block";
}

function showError(message) {
  // A critical UI practice: make sure to hide the previous result when an error occurs.
  document.getElementById("movie-info").style.display = "none";
  document.getElementById("error-message").textContent = message;
}
