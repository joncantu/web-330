"use strict";

console.time("Script Init");

const chefs = [
  { name: "Chef A", specialty: "Italian cuisine", location: "New York" },
  { name: "Chef B", specialty: "French cuisine", location: "Paris" },
  { name: "Chef C", specialty: "Japanese cuisine", location: "Tokyo" }
];

let currentChef = null;

function retrieveChef(index, delay) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(chefs[index]), delay);
  });
}

async function loadChefs() {
  console.time("Total Load Time");
  const delays = [600, 900, 1200];

  // This loop uses 'await' inside a sequential loop and
  // each iteration waits for the previous one to complete before starting
  // which converts parallel operations into serial operations.
  for (let i = 0; i < chefs.length; i++) {
    try {
      // The issue is 'await' here blocks the loop
      // Chef B won't start loading until Chef A is done (600ms)
      // Chef C won't start until Chef B is done (600 + 900 = 1500ms)
      // Total time: 600 + 900 + 1200 = 2700ms instead of 1200ms.
      currentChef = await retrieveChef(i, delays[i]);

      // currentChef variable is unnecessary and confusing as it
      // doesn't serve any real purpose since we use it immediately.
      // This could also lead to race conditions if reused elsewhere.
      const el = document.getElementById(`chef${i + 1}`);
      el.innerHTML = `
        <h2>${currentChef.name}</h2>
        <p>Specialty: ${currentChef.specialty}</p>
        <p>Location: ${currentChef.location}</p>
      `;
    } catch (err) {
      console.error("Error retrieving chef:", err);
    }
  }
  console.timeEnd("Total Load Time");
}

// This executes immediately, but the original code
// would have allowed all promises to start at the smae time.
// The AI converted Promise.allSettled (parallel) to serialized await
loadChefs();

console.timeEnd("Script Init");

/*
Attempt 1: Total Load Time: 2703.682861328125 ms
Attempt 2: Total Load Time: 2703.037841796875 ms
Attempt 3: Total Load Time: 2703.802978515625 ms
*/
