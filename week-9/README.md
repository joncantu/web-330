# Movie Rating System

A JavaScript project demonstrating async best practices with a movie rating interface.

## 📂 Project Structure

movie-rating-system/ ├── index.html # Main application ├── styles.css # Application styles ├── script.js # Application logic ├── README.md # This file └── tests/ # Test suite ├── tests.html # Test runner ├── test-suite.js # Test implementations └── README.md # Test documentation


## 🚀 Running the Application

1. Open `index.html` in a web browser
2. Search and rate movies
3. Submit reviews with ratings and text

## 🧪 Running Tests

1. Open `tests/tests.html` in a web browser
2. Click "Run All Tests" button
3. Review test results and coverage

Or run specific test suites:
- **Async Tests** - Verifies no shared state, execution order
- **Concurrency Tests** - Validates parallel execution
- **Error Tests** - Checks proper error handling

## ✅ Best Practices Demonstrated

- ✅ No shared mutable state across async boundaries
- ✅ Proper execution order with await
- ✅ Preserved concurrency (parallel operations)
- ✅ Comprehensive error handling
- ✅ Closure-captured data (race-condition free)
- ✅ Specific error messages with context

## 📚 Learning Objectives

Students will learn:
1. How to avoid race conditions in async JavaScript
2. Proper use of async/await for execution control
3. When to use Promise.all vs sequential await
4. Error handling with try-catch-finally
5. UI state management during async operations

## 🎓 Assignment Requirements Met

- ✅ Array of objects (movies with reviews)
- ✅ DOM manipulation (dynamic cards, modals)
- ✅ Async operations (simulated API calls)
- ✅ Success/error handling
- ✅ No shared global variables for async data
- ✅ ~342 lines of code (excluding comments)

## 🔍 Code Review Checklist

When reviewing student submissions, verify:
- [ ] All tests pass (23/23)
- [ ] No shared variables in async functions
- [ ] await used correctly for execution order
- [ ] Promise.all used for parallel operations
- [ ] Error messages are specific and actionable
- [ ] finally blocks used for cleanup
- [ ] UI disabled during submissions
- [ ] Model only updates after successful save
