# Assignment 8.2 - Forensic Reconstruction with Async/Await

### Assignment Instructions
For this assignment, you are given a JavaScript file that was modified by AI. The code runs, but the behavior is incorrect and inconsistent. This is intentional. Your task is to repair the code, not rewrite it. The problem in this program is caused by shared state and incorrect execution order. You will remove the shared variable and enforce the correct order using async/await.

### Required Action:
### Part I - Understand the Failure
To access the starter project for this assignment, please visit the courses GitHub repository. Before making changes, do the following:

1) Open script.js and locate this variable:
2) Notice where currentMovie is assigned and where it is used.
3) Run the program several times.
4) Observe the behavior:
 - Sometimes no movie displays
 - Sometimes the wrong movie displays
 - Behavior changes between submissions

Do *not* fix the code yet.

### Part II - Visualize the Problem
The AI-modified code behaves like this:
User submits form
→ fetchMovie() starts
→ displayMovie(currentMovie) runs immediately
→ currentMovie is still null
→ incorrect or missing output
 

What *should* happen instead is:
User submits form
→ fetchMovie() completes
→ movie data is available
→ displayMovie(movie) runs
→ correct output every time

Your changes should make the program follow the second flow.

### Part III - Make the Repair
Modify the code so that:

1) The shared variable is removed
Do not use currentMovie
Do not store movie data in a global variable

2) Execution order is enforced
fetchMovie() must complete before displayMovie() runs
Use await correctly

3) Data is passed directly
Pass the movie object into displayMovie(movie)

When fixed correctly:
The same movie information displays every time
No undefined or missing data appears
The program behaves consistently

Do not forget to stage, commit, and push your work to GitHub. 

### Part IV - Reflection
Write a short reflection (8-10 sentences) explaining:
 - What the problem was
 - Why the program behaved inconsistently
 - What change fixed the issue
 - Why that change works
 - Where AI helped and where human judgment was required

### REFLECTION (Response):

The core problem in the original code was a fundamental misunderstanding of asynchronous JavaScript, resulting in a race condition. The program behaved inconsistently because displayMovie was executed before fetchMovie had a chance to resolve and update the currentMovie variable. In JavaScript, when you call an asynchronous function without waiting for it, the rest of your synchronous code continues running immediately, creating this disconnect.

The change that ultimately fixed this issue was correctly implementing await for the fetchMovie promise and removing the global state (currentMovie). This forces the program execution within the async function to pause, waiting for the promise returned by fetchMovie to complete. The result is then stored directly into a local variable and passed, correctly and reliably, to the displayMovie function.

AI helped by quickly generating a plausible, though incorrect, boilerplate for common DOM interactions and promise-based logic - some of which may have been due to the prompt?  However, a real software developer was required to identify the subtle race condition, understand the nuances of JavaScript's event loop, and reorganize the code to enforce the correct execution order.
