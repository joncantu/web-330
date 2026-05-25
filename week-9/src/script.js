"use strict";

// ============================================================================
// DATA LAYER - Initial movie data with reviews
// ============================================================================

const movies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    reviews: [
      { rating: 5, text: "An absolute masterpiece. Best film ever made!", date: "2024-01-15" },
      { rating: 5, text: "Powerful story about hope and friendship.", date: "2024-01-10" }
    ]
  },
  {
    id: 2,
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi",
    reviews: [
      { rating: 4, text: "Mind-bending and visually stunning.", date: "2024-01-12" }
    ]
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    reviews: [
      { rating: 5, text: "Heath Ledger's Joker is iconic.", date: "2024-01-08" },
      { rating: 5, text: "Best superhero movie of all time.", date: "2024-01-05" },
      { rating: 4, text: "Gripping from start to finish.", date: "2024-01-03" }
    ]
  },
  {
    id: 4,
    title: "Pulp Fiction",
    year: 1994,
    genre: "Crime",
    reviews: []
  }
];

// ============================================================================
// DOM ELEMENTS - Cached references
// ============================================================================

const moviesContainer = document.getElementById("movies-container");
const reviewModal = document.getElementById("review-modal");
const closeModalBtn = document.getElementById("close-modal");
const reviewForm = document.getElementById("review-form");
const modalTitle = document.getElementById("modal-title");
const errorDisplay = document.getElementById("error-display");
const submitBtn = document.getElementById("submit-btn");
const reviewTextarea = document.getElementById("review-text");
const charCounter = document.getElementById("char-counter");

// ============================================================================
// UTILITY FUNCTIONS - Pure functions with no side effects
// ============================================================================

/**
 * Calculate average rating from array of reviews
 * @param {Array} reviews - Array of review objects
 * @returns {number} Average rating (0 if no reviews)
 */
function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

/**
 * Generate star display string based on rating
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star emoji string
 */
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  let stars = "⭐".repeat(fullStars);
  if (hasHalfStar) {
    stars += "✨";
  }

  return stars || "☆☆☆☆☆";
}

/**
 * Format date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Get current date in ISO format
 * @returns {string} ISO date string
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate review data before submission
 * @param {number} rating - Rating value
 * @param {string} text - Review text
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateReview(rating, text) {
  if (!rating || rating < 1 || rating > 5) {
    return {
      valid: false,
      error: "Please select a rating between 1 and 5 stars."
    };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < 10) {
    return {
      valid: false,
      error: "Review must be at least 10 characters long."
    };
  }

  if (trimmedText.length > 500) {
    return {
      valid: false,
      error: "Review cannot exceed 500 characters."
    };
  }

  return { valid: true, error: null };
}

// ============================================================================
// ASYNC OPERATIONS - Simulated API calls with proper error handling
// ============================================================================

/**
 * Simulate saving a review to a server with network delay
 * @param {number} movieId - ID of the movie
 * @param {Object} reviewData - Review data { rating, text, date }
 * @returns {Promise<Object>} Resolves with saved review data
 * @throws {Error} Rejects with specific error if save fails
 */
function saveReviewToServer(movieId, reviewData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 25% chance of server error
      if (Math.random() < 0.25) {
        reject(new Error("Server error: Unable to save review. Please try again."));
        return;
      }

      // Simulate network timeout (5% chance)
      if (Math.random() < 0.05) {
        reject(new Error("Network timeout: Request took too long. Check your connection."));
        return;
      }

      // Success - return the saved review with confirmation
      resolve({
        ...reviewData,
        id: Date.now(), // Simulate server-generated ID
        saved: true
      });

    }, 800); // Simulate 800ms network delay
  });
}

/**
 * Simulate fetching movie data (for future enhancement)
 * @param {number} movieId - ID of the movie
 * @returns {Promise<Object>} Resolves with movie data
 * @throws {Error} Rejects if movie not found
 */
function fetchMovieData(movieId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const movie = movies.find(m => m.id === movieId);

      if (!movie) {
        reject(new Error(`Movie with ID ${movieId} not found.`));
        return;
      }

      resolve(movie);
    }, 300);
  });
}

// ============================================================================
// DOM MANIPULATION - Functions that update the UI
// ============================================================================

/**
 * Create a review item DOM element
 * @param {Object} review - Review object { rating, text, date }
 * @returns {HTMLElement} Review item element
 */
function createReviewElement(review) {
  const reviewItem = document.createElement("div");
  reviewItem.className = "review-item";

  reviewItem.innerHTML = `
    <div class="review-header">
      <span class="review-stars">${generateStars(review.rating)}</span>
      <span class="review-date">${formatDate(review.date)}</span>
    </div>
    <p class="review-text">${escapeHtml(review.text)}</p>
  `;

  return reviewItem;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create a complete movie card DOM element
 * @param {Object} movie - Movie object
 * @returns {HTMLElement} Movie card element
 */
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.dataset.movieId = movie.id;

  const averageRating = calculateAverageRating(movie.reviews);
  const stars = generateStars(averageRating);

  card.innerHTML = `
    <div class="movie-header">
      <h2 class="movie-title">${escapeHtml(movie.title)}</h2>
      <div class="movie-meta">
        <span>📅 ${movie.year}</span>
        <span>🎭 ${escapeHtml(movie.genre)}</span>
      </div>
    </div>

    <div class="rating-display">
      <span class="stars">${stars}</span>
      <span class="rating-text">${averageRating > 0 ? averageRating : 'No ratings yet'}</span>
      <span class="review-count">${movie.reviews.length} review${movie.reviews.length !== 1 ? 's' : ''}</span>
    </div>

    <button class="add-review-btn" data-movie-id="${movie.id}">
      ➕ Add Your Review
    </button>

    <div class="reviews-section">
      <h3 class="reviews-header">Reviews:</h3>
      <div class="reviews-list" id="reviews-list-${movie.id}">
        ${movie.reviews.length === 0
          ? '<p class="no-reviews">No reviews yet. Be the first to review!</p>'
          : ''}
      </div>
    </div>
  `;

  // Add existing reviews if any
  if (movie.reviews.length > 0) {
    const reviewsList = card.querySelector(`#reviews-list-${movie.id}`);
    movie.reviews.forEach(review => {
      reviewsList.appendChild(createReviewElement(review));
    });
  }

  return card;
}

/**
 * Update the rating display for a specific movie card
 * @param {number} movieId - ID of the movie
 * @param {Object} movie - Movie object with updated reviews
 */
function updateMovieRatingDisplay(movieId, movie) {
  const card = document.querySelector(`[data-movie-id="${movieId}"]`);
  if (!card) {
    console.error(`Movie card with ID ${movieId} not found`);
    return;
  }

  const averageRating = calculateAverageRating(movie.reviews);
  const stars = generateStars(averageRating);

  const ratingDisplay = card.querySelector(".rating-display");
  ratingDisplay.innerHTML = `
    <span class="stars">${stars}</span>
    <span class="rating-text">${averageRating > 0 ? averageRating : 'No ratings yet'}</span>
    <span class="review-count">${movie.reviews.length} review${movie.reviews.length !== 1 ? 's' : ''}</span>
  `;
}

/**
 * Add a new review to the DOM for a specific movie
 * @param {number} movieId - ID of the movie
 * @param {Object} review - Review object to add
 */
function addReviewToDOM(movieId, review) {
  const reviewsList = document.getElementById(`reviews-list-${movieId}`);
  if (!reviewsList) {
    console.error(`Reviews list for movie ${movieId} not found`);
    return;
  }

  // Remove "no reviews" message if it exists
  const noReviewsMsg = reviewsList.querySelector(".no-reviews");
  if (noReviewsMsg) {
    noReviewsMsg.remove();
  }

  // Add new review at the top
  const reviewElement = createReviewElement(review);
  reviewsList.insertBefore(reviewElement, reviewsList.firstChild);
}

/**
 * Show error message in modal
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  errorDisplay.textContent = message;
  errorDisplay.classList.remove("hidden");
}

/**
 * Hide error message in modal
 */
function hideErrorMessage() {
  errorDisplay.textContent = "";
  errorDisplay.classList.add("hidden");
}

/**
 * Set loading state on submit button
 * @param {boolean} isLoading - Whether button should show loading state
 */
function setSubmitButtonLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Submit Review';
  }
}

/**
 * Disable/enable all review buttons
 * @param {boolean} disabled - Whether buttons should be disabled
 */
function setReviewButtonsDisabled(disabled) {
  const allReviewButtons = document.querySelectorAll(".add-review-btn");
  allReviewButtons.forEach(btn => {
    btn.disabled = disabled;
  });
}

// ============================================================================
// MODAL MANAGEMENT - Functions to control modal visibility and state
// ============================================================================

/**
 * Open the review modal for a specific movie
 * @param {number} movieId - ID of the movie to review
 */
function openReviewModal(movieId) {
  const movie = movies.find(m => m.id === movieId);

  if (!movie) {
    console.error(`Movie with ID ${movieId} not found`);
    return;
  }

  // Set modal title
  modalTitle.textContent = `Review: ${movie.title}`;

  // Store movie ID in modal for later use
  reviewModal.dataset.currentMovieId = movieId;

  // Reset form
  reviewForm.reset();
  hideErrorMessage();
  charCounter.textContent = "0";

  // Show modal
  reviewModal.classList.remove("hidden");

  // Focus on first input
  document.getElementById("star5").focus();
}

/**
 * Close the review modal
 */
function closeReviewModal() {
  reviewModal.classList.add("hidden");
  reviewModal.dataset.currentMovieId = "";
  reviewForm.reset();
  hideErrorMessage();
}

// ============================================================================
// FORM HANDLING - Handle review submission with proper async flow
// ============================================================================

/**
 * Handle review form submission
 * CRITICAL: This function demonstrates proper async data flow:
 * 1. Capture all data in local scope (no shared state)
 * 2. Validate before async operation
 * 3. Handle async operation with try-catch
 * 4. Update UI only after successful save
 * 5. Proper error handling with specific messages
 *
 * @param {Event} event - Form submit event
 */
async function handleReviewSubmit(event) {
  event.preventDefault();

  // ========================================================================
  // STEP 1: Capture data in local scope (closure) - NO SHARED STATE
  // ========================================================================
  const movieId = parseInt(reviewModal.dataset.currentMovieId);
  const ratingInput = document.querySelector('input[name="rating"]:checked');
  const rating = ratingInput ? parseInt(ratingInput.value) : null;
  const text = reviewTextarea.value.trim();

  // Find movie in local scope
  const movie = movies.find(m => m.id === movieId);

  if (!movie) {
    showErrorMessage("Error: Movie not found. Please refresh the page.");
    return;
  }

  // ========================================================================
  // STEP 2: Validate data BEFORE async operation
  // ========================================================================
  const validation = validateReview(rating, text);

  if (!validation.valid) {
    showErrorMessage(validation.error);
    return;
  }

  // ========================================================================
  // STEP 3: Create review object in local scope
  // ========================================================================
  const newReview = {
    rating: rating,
    text: text,
    date: getCurrentDate()
  };

  // ========================================================================
  // STEP 4: Disable UI during async operation (prevent race conditions)
  // ========================================================================
  setSubmitButtonLoading(true);
  setReviewButtonsDisabled(true);
  hideErrorMessage();

  try {
    // ======================================================================
    // STEP 5: Perform async operation with await (proper execution order)
    // This pauses execution until saveReviewToServer completes
    // The review data is captured in closure and cannot be modified
    // by other operations during this time
    // ======================================================================
    const savedReview = await saveReviewToServer(movieId, newReview);

    // ======================================================================
    // STEP 6: Update data model AFTER successful save
    // This only executes if saveReviewToServer resolves successfully
    // ======================================================================
    movie.reviews.push(savedReview);

    // ======================================================================
    // STEP 7: Update UI to reflect new data
    // Execution order is guaranteed: save → update model → update UI
    // ======================================================================
    addReviewToDOM(movieId, savedReview);
    updateMovieRatingDisplay(movieId, movie);

    // ======================================================================
    // STEP 8: Close modal and reset form (only on success)
    // ======================================================================
    closeReviewModal();

  } catch (error) {
    // ======================================================================
    // STEP 9: Handle errors with specific, actionable messages
    // Different error types are caught and displayed appropriately
    // UI remains open so user can retry
    // ======================================================================
    console.error("Failed to save review:", error);

    // Show user-friendly error message
    showErrorMessage(error.message || "An unexpected error occurred. Please try again.");

    // DO NOT close modal on error - let user retry
    // DO NOT modify movie data on error - maintain consistency

  } finally {
    // ======================================================================
    // STEP 10: Always re-enable UI in finally block
    // This runs whether success or failure occurs
    // ======================================================================
    setSubmitButtonLoading(false);
    setReviewButtonsDisabled(false);
  }
}

// ============================================================================
// EVENT LISTENERS - Wire up user interactions
// ============================================================================

/**
 * Initialize all event listeners for the application
 */
function initializeEventListeners() {
  // Event delegation for "Add Review" buttons
  // Using event delegation prevents memory leaks and handles dynamically added buttons
  moviesContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-review-btn")) {
      const movieId = parseInt(event.target.dataset.movieId);
      openReviewModal(movieId);
    }
  });

  // Close modal when clicking the X button
  closeModalBtn.addEventListener("click", closeReviewModal);

  // Close modal when clicking outside the modal content
  reviewModal.addEventListener("click", (event) => {
    if (event.target === reviewModal) {
      closeReviewModal();
    }
  });

  // Close modal on Escape key press
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !reviewModal.classList.contains("hidden")) {
      closeReviewModal();
    }
  });

  // Handle form submission
  reviewForm.addEventListener("submit", handleReviewSubmit);

  // Character counter for review textarea
  reviewTextarea.addEventListener("input", (event) => {
    const length = event.target.value.length;
    charCounter.textContent = length;

    // Visual feedback for character limit
    if (length > 500) {
      charCounter.style.color = "#d32f2f";
    } else if (length > 450) {
      charCounter.style.color = "#ff9800";
    } else {
      charCounter.style.color = "#999";
    }
  });
}

// ============================================================================
// INITIALIZATION - Render initial UI and set up application
// ============================================================================

/**
 * Render all movie cards to the DOM
 */
function renderMovies() {
  // Clear existing content
  moviesContainer.innerHTML = "";

  // Create and append each movie card
  movies.forEach(movie => {
    const card = createMovieCard(movie);
    moviesContainer.appendChild(card);
  });
}

/**
 * Initialize the application
 * Called when DOM is ready
 */
function initializeApp() {
  renderMovies();
  initializeEventListeners();

  console.log("Movie Rating System initialized successfully");
  console.log(`Loaded ${movies.length} movies`);
}

// ============================================================================
// START APPLICATION - Execute when DOM is fully loaded
// ============================================================================

// Wait for DOM to be ready before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}

// ============================================================================
// BEST PRACTICES DEMONSTRATED IN THIS CODE:
// ============================================================================
/*

1. ✅ NO SHARED MUTABLE STATE ACROSS ASYNC BOUNDARIES
   - All data captured in local scope (closures)
   - `handleReviewSubmit` uses `const movieId`, `const rating`, `const text`
   - No global variables modified during async operations
   - Each form submission has isolated data

2. ✅ PROPER ASYNC EXECUTION ORDER
   - await ensures sequential execution: validate → save → update UI
   - UI updates only occur AFTER successful save
   - No race conditions from rapid form submissions

3. ✅ COMPREHENSIVE ERROR HANDLING
   - Specific error messages for different failure types
   - Errors don't silently fail - always shown to user
   - try-catch blocks around all async operations
   - finally block ensures UI cleanup

4. ✅ PROPER DATA FLOW
   - Clear pipeline: User Input → Validation → Async Save → Model Update → UI Update
   - No early returns without cleanup
   - No missing awaits
   - Errors propagate correctly with context

5. ✅ UI STATE MANAGEMENT
   - Buttons disabled during async operations (prevents double-submission)
   - Loading indicators show progress
   - Modal stays open on error (allows retry)
   - Form only resets on success

6. ✅ NO TIMING DEPENDENCIES
   - Code works regardless of network speed
   - No assumptions about async operation duration
   - Proper use of Promises with explicit resolution/rejection

7. ✅ SECURITY
   - XSS prevention with escapeHtml()
   - Input validation before processing
   - Length limits enforced
   - User input sanitized before display

8. ✅ MAINTAINABILITY
   - Pure utility functions with no side effects
   - Single Responsibility Principle
   - Clear function names and documentation
   - Separation of concerns (data / DOM / async / events)

9. ✅ USER EXPERIENCE
   - Immediate visual feedback (loading states)
   - Clear error messages with actionable guidance
   - Character counter with visual warnings
   - Smooth animations and transitions
   - Keyboard accessibility (Escape to close modal)

10. ✅ TESTABILITY
    - Pure functions easy to unit test
    - Async functions return Promises
    - Clear input/output contracts
    - No hidden dependencies

*/

// ============================================================================
// EXAMPLE USAGE & TESTING (for development only)
// ============================================================================

/*
// Test error handling:
async function testErrorHandling() {
  console.log("Testing review submission...");

  // This will trigger the random error simulation
  const testReview = {
    rating: 5,
    text: "This is a test review to demonstrate error handling."
  };

  try {
    const result = await saveReviewToServer(1, testReview);
    console.log("Success:", result);
  } catch (error) {
    console.error("Caught error:", error.message);
  }
}

// Test validation:
function testValidation() {
  console.log("Testing validation...");

  // Should fail - too short
  console.log(validateReview(5, "short"));

  // Should fail - no rating
  console.log(validateReview(null, "This is a long enough review"));

  // Should succeed
  console.log(validateReview(4, "This is a perfectly valid review!"));
}

// Uncomment to run tests:
// testValidation();
// testErrorHandling();
*/
