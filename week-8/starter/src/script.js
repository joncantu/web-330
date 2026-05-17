"use strict";

const movies = [
  { title: "Blade Runner", director: "Ridley Scott", year: 1982, synopsis: "The film is set in a dystopian future Los Angeles of 2019, " +
    "in which synthetic humans known as replicants are bio-engineered by the powerful Tyrell Corporation to " +
    "work on space colonies. When a fugitive group of advanced replicants led by Roy Batty (Hauer) escapes back " +
    "to Earth, former cop Rick Deckard (Ford) is recalled to hunt them down." },
  { title: "Star Wars", director: "George Lucus", year: 1977, synopsis: "Star Wars stories are set in a fictional galaxy in the distant past." },
  { title: "Inception", director: "Christopher Nolan", year: 2010, synopsis: "A thief enters dreams." },
  { title: "The Matrix", director: "The Wachowskis", year: 1999, synopsis: "Reality is not what it seems." },
  { title: "Interstellar", director: "Christopher Nolan", year: 2014, synopsis: "A journey beyond Earth." }
];

// Remove the shared `currentMovie` variable. Data will now be passed directly between
// functions, improving reliability and state management.

function fetchMovie(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const movie = movies.find(m => m.title.toLowerCase() === title.toLowerCase());
      movie ? resolve(movie) : reject("Movie not found");
    }, 800);
  });
}

document.getElementById("movie-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const titleInput = document.getElementById("title-input");
  const errorDisplay = document.getElementById("error-message");
  const movieDisplay = document.getElementById("movie-info");

  // Clear previous results/errors immediately on submit.
  errorDisplay.textContent = "";
  movieDisplay.style.display = "none";

  const title = titleInput.value;

  try {
    // Enforce execution order: We use `await` to pause the execution of this `async`
    // function until the Promise from `fetchMovie` resolves or rejects. This guarantees
    // that the next line will only execute *after* the async operation completes.
    const foundMovie = await fetchMovie(title);

    // Data is passed directly: We pass the freshly fetched movie object directly into
    // `displayMovie`. There is no risk of using stale or missing data.
    displayMovie(foundMovie);

  } catch (err) {
    // Because we are using `await`, any rejection from the `fetchMovie` Promise will be
    // properly caught here.
    showError(err);
  }
});

function displayMovie(movie) {
  // This guard clause is still a good safety check, but won't be triggered by normal flow anymore.
  if (!movie) return;

  document.getElementById("movie-title").textContent = movie.title;
  document.getElementById("movie-director").textContent = "Director: " + movie.director;
  document.getElementById("movie-year").textContent = "Year: " + movie.year;
  document.getElementById("movie-synopsis").textContent = movie.synopsis;
  document.getElementById("movie-info").style.display = "block";
}

function showError(message) {
  // Ensure we don't display a movie info section when there's an error.
  document.getElementById("movie-info").style.display = "none";
  document.getElementById("error-message").textContent = message;
}
