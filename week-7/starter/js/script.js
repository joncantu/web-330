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

  for (let i = 0; i < chefs.length; i++) {
    try {
      currentChef = await retrieveChef(i, delays[i]);

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

loadChefs();

console.timeEnd("Script Init");

/*
Attempt 1: Total Load Time: 2703.682861328125 ms
Attempt 2: Total Load Time: 2703.037841796875 ms
Attempt 3: Total Load Time: 2703.802978515625 ms
*/
