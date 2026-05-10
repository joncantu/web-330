# Assignment Instructions

For this assignment, you will work with a small JavaScript program that retrieves and displays chef information using Promises. The starter program works correctly and is similar in structure to examples from the course textbook.

You will then use an AI-assisted tool to refactor the code. After applying the AI-generated changes, the program should begin to behave incorrectly due to how asynchronous operations are handled. Your task is not to fix the issue this week. Instead, you will capture evidence of the failure and explain what you believe caused it.

## Required Action:
### Part I - Baseline
1). Open the starter files and run the program.
2). Confirm that all three chefs display correctly.
3). Verify there are no errors and the output is consistent.

### Part II - AI-Assisted Change
To access the starter project for this assignment, please visit the courses GitHub repository.

1). Open script.js.
2). Copy the entire file into an AI-assisted tool (Copilot Chat or ChatGPT is acceptable).
3). Use this exact prompt:

### Required AI Prompt (copy/paste):

> Refactor this JavaScript so it uses async/await instead of Promise.allSettled. Keep the same HTML element IDs (chef1, chef2, chef3). Store the currently retrieved chef in a shared variable and reuse it when updating the DOM. Do not add any libraries. Output the full updated script.js file.
 

4). Replace your script.js with the AI-generated version.
5). Refresh the page multiple times and observe the output.

You should notice inconsistent or incorrect behavior.

### Part III - Evidence and Reflection

1). Add comments in script.js describing what appears to be going wrong.
2). Write a short reflection (8–10 sentences) addressing:
 - What the AI changed correctly
 - What the AI missed or misunderstood
 - What evidence shows the code is failing
 - Why this type of failure matters in real applications

Do not forget to stage, commit, and push your work to GitHub. 

Submission Instructions:
Due Date: Day 7 of the week by 11:59 PM (CST/CDT).
Solution folder, packaged as a ZIP file.
Link to your web-330 GitHub repository
Reflection document (DOCX or PDF)
