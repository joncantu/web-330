"use strict";

console.time("Script Init");

const chefs = [
  { name: "Chef A", specialty: "Italian cuisine", location: "New York" },
  { name: "Chef B", specialty: "French cuisine", location: "Paris" },
  { name: "Chef C", specialty: "Japanese cuisine", location: "Tokyo" }
];

function retrieveChef(index, delay) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(chefs[index]), delay);
  });
}

console.time("Total Load Time");

Promise.allSettled([
  retrieveChef(0, 600),
  retrieveChef(1, 900),
  retrieveChef(2, 1200)
]).then(results => {
  results.forEach((result, index) => {
    const el = document.getElementById(`chef${index + 1}`);
    if (result.status === "fulfilled") {
      el.innerHTML = `<h2>${result.value.name}</h2>
                      <p>Specialty: ${result.value.specialty}</p>
                      <p>Location: ${result.value.location}</p>`;
    }
  });
  console.timeEnd("Total Load Time"); // Total Load Time Between: 0.1450 ms and 0.2888 ms
});

console.timeEnd("Script Init"); // Total Load Time Between: 0.1450 ms and 0.2888 ms

/*
Attempt 1: Total Load Time: 1201.89697265625 ms
Attempt 2: Total Load Time: 1201.693115234375 ms
Attempt 3: Total Load Time: 1202.044921875 ms
*/
