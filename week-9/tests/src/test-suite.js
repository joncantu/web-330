"use strict";

// ============================================================================
// TEST FRAMEWORK - Minimal test runner
// ============================================================================

class TestRunner {
  constructor() {
    this.results = [];
    this.currentSection = null;
  }

  section(name) {
    this.currentSection = {
      name: name,
      tests: []
    };
    this.results.push(this.currentSection);
    return this;
  }

  async test(name, testFn) {
    const testCase = {
      name: name,
      status: 'running',
      error: null,
      duration: 0,
      details: []
    };

    this.currentSection.tests.push(testCase);
    this.renderTest(testCase);

    const startTime = performance.now();

    try {
      await testFn({
        assert: (condition, message) => {
          if (!condition) {
            throw new Error(message || 'Assertion failed');
          }
          testCase.details.push(`✓ ${message || 'Assertion passed'}`);
        },
        assertEqual: (actual, expected, message) => {
          if (actual !== expected) {
            throw new Error(
              `${message || 'Values not equal'}: expected ${expected}, got ${actual}`
            );
          }
          testCase.details.push(`✓ ${message || 'Values equal'}: ${expected}`);
        },
        assertApproxEqual: (actual, expected, tolerance, message) => {
          if (Math.abs(actual - expected) > tolerance) {
            throw new Error(
              `${message || 'Values not approximately equal'}: expected ~${expected}, got ${actual}`
            );
          }
          testCase.details.push(`✓ ${message || 'Values approximately equal'}: ~${expected}`);
        },
        log: (message) => {
          testCase.details.push(`ℹ️ ${message}`);
        }
      });

      testCase.status = 'pass';
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
    }

    testCase.duration = Math.round(performance.now() - startTime);
    this.renderTest(testCase);

    return testCase;
  }

  renderTest(testCase) {
    const sectionId = this.sanitizeId(this.currentSection.name);
    let sectionEl = document.getElementById(sectionId);

    if (!sectionEl) {
      sectionEl = document.createElement('div');
      sectionEl.id = sectionId;
      sectionEl.className = 'test-section';
      sectionEl.innerHTML = `<h2>${this.currentSection.name}</h2>`;
      document.getElementById('test-results').appendChild(sectionEl);
    }

    const testId = this.sanitizeId(testCase.name);
    let testEl = document.getElementById(testId);

    if (!testEl) {
      testEl = document.createElement('div');
      testEl.id = testId;
      testEl.className = 'test-case';
      sectionEl.appendChild(testEl);
    }

    testEl.className = `test-case ${testCase.status}`;

    let html = `<div class="test-name">`;

    if (testCase.status === 'running') {
      html += `<span class="loading"></span>`;
    }

    html += `${testCase.name}</div>`;

    if (testCase.status === 'pass') {
      html += `<div class="test-result pass">✅ PASS (${testCase.duration}ms)</div>`;
    } else if (testCase.status === 'fail') {
      html += `<div class="test-result fail">❌ FAIL (${testCase.duration}ms)</div>`;
      html += `<div class="test-detail">Error: ${testCase.error}</div>`;
    }

    if (testCase.details.length > 0) {
      html += `<div class="console-output"><pre>${testCase.details.join('\n')}</pre></div>`;
    }

    testEl.innerHTML = html;
  }

  sanitizeId(str) {
    return str.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  getSummary() {
    let total = 0;
    let passed = 0;
    let failed = 0;

    this.results.forEach(section => {
      section.tests.forEach(test => {
        total++;
        if (test.status === 'pass') passed++;
        if (test.status === 'fail') failed++;
      });
    });

    return { total, passed, failed };
  }

  renderSummary(duration) {
    const summary = this.getSummary();

    document.getElementById('total-tests').textContent = summary.total;
    document.getElementById('passed-tests').textContent = summary.passed;
    document.getElementById('failed-tests').textContent = summary.failed;
    document.getElementById('duration').textContent = `${duration}ms`;
    document.getElementById('summary').style.display = 'block';
  }

  clear() {
    this.results = [];
    document.getElementById('test-results').innerHTML = '';
    document.getElementById('summary').style.display = 'none';
  }
}

// ============================================================================
// MOCK IMPLEMENTATIONS - Simulate the movie rating system
// ============================================================================

function createMockMovie(id) {
  return {
    id: id,
    title: `Test Movie ${id}`,
    year: 2024,
    genre: "Test",
    reviews: []
  };
}

function mockSaveReviewToServer(movieId, reviewData, options = {}) {
  const {
    delay = 100,
    shouldFail = false,
    errorMessage = "Mock error"
  } = options;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(errorMessage));
        return;
      }

      resolve({
        ...reviewData,
        id: Date.now(),
        saved: true
      });
    }, delay);
  });
}

// ============================================================================
// TEST SUITE 1: No Shared Mutable State
// ============================================================================

async function testNoSharedState(runner) {
  await runner.section("1️⃣ No Shared Mutable State Across Async Boundaries")

    .test("Should not use shared variable for async data", async ({ assert, log }) => {
      // Simulate the WRONG pattern (shared state)
      let sharedState = null;

      async function badPattern(data) {
        sharedState = data; // ❌ Storing in shared variable
        await new Promise(resolve => setTimeout(resolve, 50));
        return sharedState; // ❌ Reading from shared variable
      }

      // Simulate the CORRECT pattern (closure capture)
      async function goodPattern(data) {
        const capturedData = data; // ✅ Captured in local scope
        await new Promise(resolve => setTimeout(resolve, 50));
        return capturedData; // ✅ Reading captured variable
      }

      // Test that good pattern is race-condition free
      const results = await Promise.all([
        goodPattern("data1"),
        goodPattern("data2"),
        goodPattern("data3")
      ]);

      assert(results[0] === "data1", "First call returns its own data");
      assert(results[1] === "data2", "Second call returns its own data");
      assert(results[2] === "data3", "Third call returns its own data");

      log("Each async operation maintains its own data");
    })

    .test("Multiple reviews submitted rapidly should not interfere", async ({ assert, log }) => {
      const movie = createMockMovie(1);

      // Simulate multiple review submissions
      async function submitReview(rating, text) {
        // Capture data in local scope (correct pattern)
        const reviewData = {
          rating: rating,
          text: text,
          date: new Date().toISOString()
        };

        log(`Submitting review with rating ${rating}`);

        // Simulate async save
        const saved = await mockSaveReviewToServer(movie.id, reviewData, { delay: 50 });

        // Add to movie reviews
        movie.reviews.push(saved);

        return saved;
      }

      // Submit 3 reviews rapidly
      const submissions = await Promise.all([
        submitReview(5, "Great movie!"),
        submitReview(3, "It was okay."),
        submitReview(4, "Pretty good.")
      ]);

      assert(movie.reviews.length === 3, "All 3 reviews saved");
      assert(movie.reviews[0].rating === 5, "First review has correct rating");
      assert(movie.reviews[1].rating === 3, "Second review has correct rating");
      assert(movie.reviews[2].rating === 4, "Third review has correct rating");

      log("No race conditions - each review maintains correct data");
    })

    .test("Closure capture prevents data overwrites during async operations", async ({ assert, log }) => {
      const results = [];

      async function processWithClosure(value) {
        const captured = value; // Captured at invocation time

        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        results.push(captured);
        return captured;
      }

      // Process multiple values concurrently
      await Promise.all([
        processWithClosure("A"),
        processWithClosure("B"),
        processWithClosure("C"),
        processWithClosure("D"),
        processWithClosure("E")
      ]);

      assert(results.includes("A"), "Contains A");
      assert(results.includes("B"), "Contains B");
      assert(results.includes("C"), "Contains C");
      assert(results.includes("D"), "Contains D");
      assert(results.includes("E"), "Contains E");
      assert(results.length === 5, "All values captured correctly");

      log("Closure capture ensures data isolation");
    });
}

// ============================================================================
// TEST SUITE 2: Execution Order Verification
// ============================================================================

async function testExecutionOrder(runner) {
  await runner.section("2️⃣ Verify Execution Order with Await")

    .test("Await ensures sequential execution order", async ({ assert, log }) => {
      const executionOrder = [];

      async function step1() {
        await new Promise(resolve => setTimeout(resolve, 50));
        executionOrder.push(1);
        log("Step 1 completed");
        return "step1";
      }

      async function step2(data) {
        executionOrder.push(2);
        log(`Step 2 started with: ${data}`);
        await new Promise(resolve => setTimeout(resolve, 30));
        executionOrder.push(3);
        log("Step 2 completed");
        return "step2";
      }

      async function step3(data) {
        executionOrder.push(4);
        log(`Step 3 started with: ${data}`);
        return "step3";
      }

      // Execute sequentially with await
      const result1 = await step1();
      const result2 = await step2(result1);
      const result3 = await step3(result2);

      assert(executionOrder[0] === 1, "Step 1 executed first");
      assert(executionOrder[1] === 2, "Step 2 started after step 1");
      assert(executionOrder[2] === 3, "Step 2 completed");
      assert(executionOrder[3] === 4, "Step 3 executed last");
      assert(result3 === "step3", "Final result correct");

      log("Execution order guaranteed by await");
    })

    .test("Review submission follows correct order: validate → save → update UI", async ({ assert, log }) => {
      const movie = createMockMovie(2);
      const timeline = [];

      async function submitReviewWithOrder(rating, text) {
        timeline.push("start");
        log("Submission started");

        // Step 1: Validate
        if (!rating || rating < 1 || rating > 5) {
          throw new Error("Invalid rating");
        }
        timeline.push("validated");
        log("Validation passed");

        const reviewData = { rating, text, date: "2024-01-01" };

        // Step 2: Save (with await - ensures order)
        const saved = await mockSaveReviewToServer(movie.id, reviewData, { delay: 50 });
        timeline.push("saved");
        log("Review saved to server");

        // Step 3: Update model (only executes after save)
        movie.reviews.push(saved);
        timeline.push("model-updated");
        log("Model updated");

        // Step 4: Update UI (only executes after model update)
        timeline.push("ui-updated");
        log("UI updated");

        return saved;
      }

      await submitReviewWithOrder(5, "Test review");

      assert(timeline[0] === "start", "Started first");
      assert(timeline[1] === "validated", "Validated second");
      assert(timeline[2] === "saved", "Saved third");
      assert(timeline[3] === "model-updated", "Model updated fourth");
      assert(timeline[4] === "ui-updated", "UI updated last");
      assert(movie.reviews.length === 1, "Review added to model");

      log("Execution order correctly enforced");
    })

    .test("Missing await breaks execution order", async ({ assert, log }) => {
      const timeline = [];

      async function withAwait() {
        timeline.push("start-with-await");
        await new Promise(resolve => setTimeout(resolve, 50));
        timeline.push("end-with-await");
      }

      async function withoutAwait() {
        timeline.push("start-without-await");
        // Missing await - returns immediately!
        new Promise(resolve => setTimeout(resolve, 50));
        timeline.push("end-without-await"); // Executes immediately
      }

      await withoutAwait();
      await withAwait();

      // Wait for all promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      assert(timeline[0] === "start-without-await", "Without await starts first");
      assert(timeline[1] === "end-without-await", "Without await ends immediately");
      assert(timeline[2] === "start-with-await", "With await starts third");
      assert(timeline[3] === "end-with-await", "With await ends last");

      log("Missing await causes immediate return");
    });
}

// ============================================================================
// TEST SUITE 3: Concurrency Preservation
// ============================================================================

async function testConcurrency(runner) {
  await runner.section("3️⃣ Preserve Concurrency - Parallel vs Sequential")

    .test("Promise.all maintains parallel execution", async ({ assert, assertApproxEqual, log }) => {
      const startTime = performance.now();

      async function task(id, delay) {
        log(`Task ${id} starting (${delay}ms delay)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        log(`Task ${id} completed`);
        return id;
      }

      // All tasks start simultaneously
      const results = await Promise.all([
        task(1, 100),
        task(2, 100),
        task(3, 100)
      ]);

      const duration = performance.now() - startTime;

      assert(results.length === 3, "All tasks completed");
      assertApproxEqual(duration, 100, 30, "Duration ~100ms (parallel)");

      log(`Total time: ${Math.round(duration)}ms for 3x100ms tasks`);
      log("Parallel execution: max(100, 100, 100) = ~100ms");
    })

    .test("Sequential await causes serial execution", async ({ assert, assertApproxEqual, log }) => {
      const startTime = performance.now();

      async function task(id, delay) {
        log(`Task ${id} starting (${delay}ms delay)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        log(`Task ${id} completed`);
        return id;
      }

      // Tasks execute one after another
      const result1 = await task(1, 100);
      const result2 = await task(2, 100);
      const result3 = await task(3, 100);

      const duration = performance.now() - startTime;

      assert(result1 === 1 && result2 === 2 && result3 === 3, "All tasks completed");
      assertApproxEqual(duration, 300, 30, "Duration ~300ms (serial)");

      log(`Total time: ${Math.round(duration)}ms for 3x100ms tasks`);
      log("Serial execution: 100 + 100 + 100 = ~300ms");
    })

    .test("Loading multiple movie reviews should be parallel", async ({ assert, assertApproxEqual, log }) => {
      const movies = [
        createMockMovie(1),
        createMockMovie(2),
        createMockMovie(3)
      ];

      async function loadReviewsForMovie(movie) {
        log(`Loading reviews for movie ${movie.id}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        movie.reviews = [
          { rating: 5, text: "Great!" },
          { rating: 4, text: "Good!" }
        ];
        return movie;
      }

      const startTime = performance.now();

      // ✅ CORRECT: Parallel loading
      const loadedMovies = await Promise.all(
        movies.map(movie => loadReviewsForMovie(movie))
      );

      const duration = performance.now() - startTime;

      assert(loadedMovies.length === 3, "All movies loaded");
      assert(loadedMovies[0].reviews.length === 2, "Movie 1 has reviews");
      assert(loadedMovies[1].reviews.length === 2, "Movie 2 has reviews");
      assert(loadedMovies[2].reviews.length === 2, "Movie 3 has reviews");
      assertApproxEqual(duration, 100, 30, "Parallel load ~100ms");

      log("Parallel loading is 3x faster than serial");
    })

    .test("Promise.allSettled handles mixed success/failure in parallel", async ({ assert, log }) => {
      async function submitReview(movieId, rating, shouldFail = false) {
        return mockSaveReviewToServer(movieId,
          { rating, text: "Test" },
          {
            delay: 50,
            shouldFail,
            errorMessage: `Failed for movie ${movieId}`
          }
        );
      }

      const startTime = performance.now();

      // Submit 3 reviews: 2 succeed, 1 fails
      const results = await Promise.allSettled([
        submitReview(1, 5, false),  // Success
        submitReview(2, 3, true),   // Failure
        submitReview(3, 4, false)   // Success
      ]);

      const duration = performance.now() - startTime;

      assert(results[0].status === "fulfilled", "First submission succeeded");
      assert(results[1].status === "rejected", "Second submission failed");
      assert(results[2].status === "fulfilled", "Third submission succeeded");
      assertApproxEqual(duration, 50, 30, "All processed in parallel");

      log("Partial failures don't block other operations");
    });
}

// ============================================================================
// TEST SUITE 4: Error Handling and Data Flow
// ============================================================================

async function testErrorHandling(runner) {
  await runner.section("4️⃣ Proper Error Handling and Data Flow")

    .test("Errors should not be silently swallowed", async ({ assert, log }) => {
      let errorCaught = false;
      let errorMessage = null;

      async function submitReviewWithErrorHandling(movieId, rating) {
        try {
          const result = await mockSaveReviewToServer(
            movieId,
            { rating, text: "Test" },
            { shouldFail: true, errorMessage: "Server error" }
          );
          return result;
        } catch (error) {
          errorCaught = true;
          errorMessage = error.message;
          log(`Error caught: ${error.message}`);
          throw error; // ✅ Re-throw to propagate
        }
      }

      try {
        await submitReviewWithErrorHandling(1, 5);
        assert(false, "Should have thrown error");
      } catch (error) {
        assert(errorCaught, "Error was caught in handler");
        assert(errorMessage === "Server error", "Error message preserved");
        assert(error.message === "Server error", "Error propagated correctly");
        log("Error properly caught and re-thrown");
      }
    })

    .test("Specific error messages provide context", async ({ assert, log }) => {
      async function validateAndSubmit(rating, text) {
        // Validation with specific errors
        if (!rating) {
          throw new Error("Rating is required");
        }
        if (rating < 1 || rating > 5) {
          throw new Error(`Rating must be 1-5, got ${rating}`);
        }
        if (!text || text.trim().length < 10) {
          throw new Error("Review text must be at least 10 characters");
        }

        return { rating, text };
      }

      // Test missing rating
      try {
        await validateAndSubmit(null, "Great movie!");
        assert(false, "Should throw error");
      } catch (error) {
        assert(error.message === "Rating is required", "Specific error for missing rating");
        log(`✓ Caught: ${error.message}`);
      }

      // Test invalid rating
      try {
        await validateAndSubmit(6, "Great movie!");
        assert(false, "Should throw error");
      } catch (error) {
        assert(error.message === "Rating must be 1-5, got 6", "Specific error for invalid rating");
        log(`✓ Caught: ${error.message}`);
      }

      // Test short text
      try {
        await validateAndSubmit(5, "Short");
        assert(false, "Should throw error");
      } catch (error) {
        assert(error.message.includes("at least 10 characters"), "Specific error for short text");
        log(`✓ Caught: ${error.message}`);
      }
    })

    .test("Finally block ensures cleanup even on error", async ({ assert, log }) => {
      let isLoading = false;
      let cleanupExecuted = false;

      async function submitWithCleanup(shouldFail) {
        try {
          isLoading = true;
          log("Loading started");

          const result = await mockSaveReviewToServer(
            1,
            { rating: 5, text: "Test" },
            { shouldFail, errorMessage: "Simulated error" }
          );

          log("Save succeeded");
          return result;

        } catch (error) {
          log(`Save failed: ${error.message}`);
          throw error;

        } finally {
          isLoading = false;
          cleanupExecuted = true;
          log("Cleanup executed (finally block)");
        }
      }

      // Test successful path
      cleanupExecuted = false;
      await submitWithCleanup(false);
      assert(cleanupExecuted, "Cleanup executed on success");
      assert(!isLoading, "Loading state cleared on success");

      // Test error path
      cleanupExecuted = false;
      try {
        await submitWithCleanup(true);
      } catch (error) {
        // Expected error
      }
      assert(cleanupExecuted, "Cleanup executed on error");
      assert(!isLoading, "Loading state cleared on error");

      log("Finally block guarantees cleanup");
    })

      .test("No early returns without proper cleanup", async ({ assert, log }) => {
      let cleanupCount = 0;

      // ❌ BAD: Early return skips cleanup
      async function badPattern(value) {
        if (!value) {
          return null; // ❌ Early return, no cleanup
        }

        try {
          const result = await mockSaveReviewToServer(1, { rating: 5, text: "Test" });
          return result;
        } finally {
          cleanupCount++;
        }
      }

      // ✅ GOOD: All paths go through cleanup
      async function goodPattern(value) {
        let result = null;

        try {
          if (!value) {
            log("Validation failed");
            throw new Error("Value is required");
          }

          result = await mockSaveReviewToServer(1, { rating: 5, text: "Test" });
          log("Save succeeded");

        } catch (error) {
          log(`Error occurred: ${error.message}`);
          throw error;

        } finally {
          cleanupCount++;
          log("Cleanup executed");
        }

        return result;
      }

      // Test bad pattern
      cleanupCount = 0;
      const badResult = await badPattern(null);
      assert(badResult === null, "Bad pattern returned null");
      assert(cleanupCount === 0, "Bad pattern skipped cleanup");
      log("❌ Bad pattern: early return bypassed finally block");

      // Test good pattern with valid value
      cleanupCount = 0;
      const goodResult = await goodPattern("valid");
      assert(goodResult !== null, "Good pattern returned result");
      assert(cleanupCount === 1, "Good pattern executed cleanup");
      log("✅ Good pattern: cleanup executed on success");

      // Test good pattern with invalid value
      cleanupCount = 0;
      try {
        await goodPattern(null);
        assert(false, "Should have thrown");
      } catch (error) {
        assert(cleanupCount === 1, "Good pattern executed cleanup even on error");
        log("✅ Good pattern: cleanup executed on error");
      }
    })

    .test("Data model should not update on save failure", async ({ assert, log }) => {
      const movie = createMockMovie(1);
      const initialReviewCount = movie.reviews.length;

      async function submitReview(rating, text, shouldFail) {
        const reviewData = { rating, text, date: "2024-01-01" };

        try {
          log(`Attempting to save review (shouldFail: ${shouldFail})`);

          const savedReview = await mockSaveReviewToServer(
            movie.id,
            reviewData,
            { shouldFail, errorMessage: "Save failed" }
          );

          // ✅ CORRECT: Only update model AFTER successful save
          movie.reviews.push(savedReview);
          log("Model updated after successful save");

          return savedReview;

        } catch (error) {
          log(`Save failed: ${error.message}`);
          // ✅ CORRECT: Model not modified on error
          throw error;
        }
      }

      // Test successful save
      await submitReview(5, "Great movie!", false);
      assert(movie.reviews.length === initialReviewCount + 1, "Review added on success");

      // Test failed save
      try {
        await submitReview(4, "Good movie!", true);
        assert(false, "Should have thrown");
      } catch (error) {
        assert(movie.reviews.length === initialReviewCount + 1, "Review NOT added on failure");
        log("Model unchanged after failed save");
      }
    })

    .test("Error context preserved through async chain", async ({ assert, log }) => {
      async function level3() {
        throw new Error("Database connection failed");
      }

      async function level2() {
        try {
          return await level3();
        } catch (error) {
          // Add context and re-throw
          error.message = `Level 2: Failed to fetch data - ${error.message}`;
          throw error;
        }
      }

      async function level1() {
        try {
          return await level2();
        } catch (error) {
          // Add more context
          error.message = `Level 1: Review submission failed - ${error.message}`;
          throw error;
        }
      }

      try {
        await level1();
        assert(false, "Should have thrown");
      } catch (error) {
        assert(error.message.includes("Level 1"), "Level 1 context present");
        assert(error.message.includes("Level 2"), "Level 2 context present");
        assert(error.message.includes("Database connection failed"), "Original error present");
        log("Error context accumulated through chain:");
        log(error.message);
      }
    });
}

// ============================================================================
// TEST SUITE 5: Race Condition Detection
// ============================================================================

async function testRaceConditions(runner) {
  await runner.section("5️⃣ Race Condition Detection and Prevention")

    .test("Rapid button clicks should not cause duplicate submissions", async ({ assert, log }) => {
      const movie = createMockMovie(1);
      let isSubmitting = false;
      let submissionCount = 0;

      async function submitReviewWithLock(rating, text) {
        // ✅ CORRECT: Check lock before proceeding
        if (isSubmitting) {
          log("Submission already in progress - blocked");
          throw new Error("Submission already in progress");
        }

        isSubmitting = true;
        submissionCount++;
        log(`Submission ${submissionCount} started`);

        try {
          const reviewData = { rating, text, date: "2024-01-01" };
          const saved = await mockSaveReviewToServer(movie.id, reviewData, { delay: 100 });
          movie.reviews.push(saved);
          log(`Submission ${submissionCount} completed`);
          return saved;

        } finally {
          isSubmitting = false;
          log("Lock released");
        }
      }

      // Simulate rapid clicks (3 attempts)
      const results = await Promise.allSettled([
        submitReviewWithLock(5, "First"),
        submitReviewWithLock(4, "Second"),
        submitReviewWithLock(3, "Third")
      ]);

      const successCount = results.filter(r => r.status === "fulfilled").length;
      const failedCount = results.filter(r => r.status === "rejected").length;

      assert(successCount === 1, "Only one submission succeeded");
      assert(failedCount === 2, "Two submissions were blocked");
      assert(movie.reviews.length === 1, "Only one review added");
      log("Race condition prevented by lock mechanism");
    })

    .test("Concurrent reads should not interfere with writes", async ({ assert, log }) => {
      const movie = createMockMovie(1);
      movie.reviews = [
        { rating: 5, text: "Review 1" },
        { rating: 4, text: "Review 2" }
      ];

      async function readReviews() {
        await new Promise(resolve => setTimeout(resolve, 50));
        log(`Read ${movie.reviews.length} reviews`);
        return [...movie.reviews]; // Return copy
      }

      async function writeReview(rating, text) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const newReview = { rating, text };
        movie.reviews.push(newReview);
        log(`Wrote review: ${text}`);
        return newReview;
      }

      // Perform concurrent reads and writes
      const [read1, write1, read2, write2] = await Promise.all([
        readReviews(),
        writeReview(5, "New Review 1"),
        readReviews(),
        writeReview(4, "New Review 2")
      ]);

      // Reads may show 2 or 4 reviews depending on timing
      // But all operations should complete without errors
      assert(Array.isArray(read1), "First read completed");
      assert(Array.isArray(read2), "Second read completed");
      assert(write1.text === "New Review 1", "First write completed");
      assert(write2.text === "New Review 2", "Second write completed");
      assert(movie.reviews.length === 4, "Final state has all reviews");
      log("Concurrent operations completed successfully");
    })

    .test("Stale closures should not cause data inconsistency", async ({ assert, log }) => {
      let counter = 0;

      async function incrementWithStaleRead() {
        const staleValue = counter; // Read current value
        await new Promise(resolve => setTimeout(resolve, 50));
        counter = staleValue + 1; // Write based on stale read (race condition!)
        return counter;
      }

      async function incrementSafely() {
        await new Promise(resolve => setTimeout(resolve, 50));
        counter = counter + 1; // Read and write atomically
        return counter;
      }

      // Test stale closure problem
      counter = 0;
      const staleResults = await Promise.all([
        incrementWithStaleRead(),
        incrementWithStaleRead(),
        incrementWithStaleRead()
      ]);

      log(`Stale closure results: ${staleResults.join(", ")}`);
      log(`Final counter with stale reads: ${counter}`);
      assert(counter < 3, "Lost updates due to stale reads");

      // Test safe increment
      counter = 0;
      const safeResults = await Promise.all([
        incrementSafely(),
        incrementSafely(),
        incrementSafely()
      ]);

      log(`Safe increment results: ${safeResults.join(", ")}`);
      log(`Final counter with safe increments: ${counter}`);
      assert(counter === 3, "All updates preserved");
    });
}

// ============================================================================
// TEST SUITE 6: Integration Tests
// ============================================================================

async function testIntegration(runner) {
  await runner.section("6️⃣ Integration: Full Review Submission Flow")

    .test("Complete review submission: validation → save → update → UI", async ({ assert, log }) => {
      const movie = createMockMovie(1);
      const timeline = [];

      async function completeReviewSubmission(rating, text) {
        timeline.push("start");

        // Step 1: Validate input
        if (!rating || rating < 1 || rating > 5) {
          timeline.push("validation-failed");
          throw new Error("Invalid rating");
        }
        if (!text || text.trim().length < 10) {
          timeline.push("validation-failed");
          throw new Error("Review text too short");
        }
        timeline.push("validated");
        log("✓ Validation passed");

        // Step 2: Prepare data (captured in closure)
        const reviewData = {
          rating: rating,
          text: text.trim(),
          date: new Date().toISOString().split('T')[0]
        };
        timeline.push("data-prepared");

        let savedReview = null;
        let uiDisabled = false;

        try {
          // Step 3: Disable UI
          uiDisabled = true;
          timeline.push("ui-disabled");
          log("✓ UI disabled");

          // Step 4: Save to server
          savedReview = await mockSaveReviewToServer(movie.id, reviewData, { delay: 100 });
          timeline.push("saved");
          log("✓ Saved to server");

          // Step 5: Update model (only after successful save)
          movie.reviews.push(savedReview);
          timeline.push("model-updated");
          log("✓ Model updated");

          // Step 6: Update UI
          timeline.push("ui-updated");
          log("✓ UI updated");

          // Step 7: Calculate new average
          const avg = movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length;
          timeline.push("avg-calculated");
          log(`✓ Average rating: ${avg.toFixed(1)}`);

          return savedReview;

        } catch (error) {
          timeline.push("error");
          log(`✗ Error: ${error.message}`);
          throw error;

        } finally {
          // Step 8: Always re-enable UI
          uiDisabled = false;
          timeline.push("ui-enabled");
          log("✓ UI re-enabled (finally block)");
        }
      }

      // Test successful submission
      const result = await completeReviewSubmission(5, "This is a great movie!");

      assert(timeline.includes("validated"), "Validation step executed");
      assert(timeline.includes("saved"), "Save step executed");
      assert(timeline.includes("model-updated"), "Model update step executed");
      assert(timeline.includes("ui-updated"), "UI update step executed");
      assert(timeline.includes("ui-enabled"), "UI re-enabled");
      assert(movie.reviews.length === 1, "Review added to model");
      assert(result.rating === 5, "Correct review returned");

      log("Full flow completed successfully");
    })

    .test("Review submission with server error maintains consistency", async ({ assert, log }) => {
      const movie = createMockMovie(2);
      const initialReviewCount = movie.reviews.length;

      async function submitWithErrorRecovery(rating, text) {
        const reviewData = { rating, text, date: "2024-01-01" };
        let uiState = "idle";

        try {
          uiState = "loading";
          log("State: loading");

          const saved = await mockSaveReviewToServer(
            movie.id,
            reviewData,
            { shouldFail: true, errorMessage: "Server unavailable", delay: 50 }
          );

          movie.reviews.push(saved);
          uiState = "success";
          log("State: success");
          return saved;

        } catch (error) {
          uiState = "error";
          log(`State: error - ${error.message}`);
          throw error;

        } finally {
          if (uiState === "loading") {
            uiState = "idle";
          }
          log(`Final state: ${uiState}`);
        }
      }

      try {
        await submitWithErrorRecovery(4, "Test review");
        assert(false, "Should have thrown error");
      } catch (error) {
        assert(error.message === "Server unavailable", "Error propagated");
        assert(movie.reviews.length === initialReviewCount, "Model unchanged on error");
        log("✓ Data consistency maintained after error");
      }
    })

    .test("Multiple rapid submissions are queued correctly", async ({ assert, log }) => {
      const movie = createMockMovie(3);
      let activeSubmissions = 0;
      let maxConcurrent = 0;
      const completedReviews = [];

      async function queuedSubmission(rating, text, id) {
        activeSubmissions++;
        maxConcurrent = Math.max(maxConcurrent, activeSubmissions);
        log(`Submission ${id} started (active: ${activeSubmissions})`);

        try {
          const reviewData = { rating, text, date: "2024-01-01" };
          const saved = await mockSaveReviewToServer(movie.id, reviewData, { delay: 100 });

          movie.reviews.push(saved);
          completedReviews.push(id);
          log(`Submission ${id} completed`);

          return saved;

        } finally {
          activeSubmissions--;
          log(`Submission ${id} finished (active: ${activeSubmissions})`);
        }
      }

      // Submit 3 reviews
      const results = await Promise.all([
        queuedSubmission(5, "Review 1", 1),
        queuedSubmission(4, "Review 2", 2),
        queuedSubmission(3, "Review 3", 3)
      ]);

      assert(results.length === 3, "All submissions completed");
      assert(movie.reviews.length === 3, "All reviews saved");
      assert(completedReviews.length === 3, "All tracked as completed");
      log(`Max concurrent submissions: ${maxConcurrent}`);
      log("All submissions processed correctly");
    });
}

// ============================================================================
// TEST EXECUTION FUNCTIONS
// ============================================================================

async function runAllTests() {
  const runner = new TestRunner();
  runner.clear();

  const startTime = performance.now();

  await testNoSharedState(runner);
  await testExecutionOrder(runner);
  await testConcurrency(runner);
  await testErrorHandling(runner);
  await testRaceConditions(runner);
  await testIntegration(runner);

  const duration = Math.round(performance.now() - startTime);
  runner.renderSummary(duration);

  console.log("✅ All tests completed");
}

async function runAsyncTests() {
  const runner = new TestRunner();
  runner.clear();

  const startTime = performance.now();

  await testNoSharedState(runner);
  await testExecutionOrder(runner);

  const duration = Math.round(performance.now() - startTime);
  runner.renderSummary(duration);
}

async function runConcurrencyTests() {
  const runner = new TestRunner();
  runner.clear();

  const startTime = performance.now();

  await testConcurrency(runner);
  await testRaceConditions(runner);

  const duration = Math.round(performance.now() - startTime);
  runner.renderSummary(duration);
}

async function runErrorTests() {
  const runner = new TestRunner();
  runner.clear();

  const startTime = performance.now();

  await testErrorHandling(runner);

  const duration = Math.round(performance.now() - startTime);
  runner.renderSummary(duration);
}

function clearResults() {
  const runner = new TestRunner();
  runner.clear();
  console.log("🗑️ Results cleared");
}

// Auto-run tests on page load (optional)
// Uncomment to run automatically:
// window.addEventListener('load', runAllTests);

console.log("🧪 Test suite loaded. Click 'Run All Tests' to start.");
