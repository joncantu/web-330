"use strict";
/*    JavaScript 7th Edition
      Chapter 11
      Project 11-02

      Project to city and state information from a provided postal code
      Author:
      Date:

      Filename: project11-02.js
*/

/*
   JavaScript 7th Edition
   Chapter 11
   Hands-on Project 11-2

   Author: Jonathan Canu
   Date:   May 2nd, 2026

   Filename: project11-02.js
*/

let postalCode = document.getElementById("postalCode");
let place = document.getElementById("place");
let region = document.getElementById("region");
let country = document.getElementById("country");

// Prevents the re-activation of the alert
let isAlertActive = false;

postalCode.onblur = function() {

  if (postalCode.value === "") return;

  // Stop if the alert is already active
  if (isAlertActive) return;

  place.value = "";
  region.value = "";
  postalCodeRO.value = "";

  // Set the Alert-Active Flag to TRUE
  isAlertActive = true;

  // Capture user input
  let countryValue = country.value;
  let codeValue = postalCode.value;

  // Use the API with error handling
  fetch(`http://api.zippopotam.us/${countryValue}/${codeValue}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(json => {
      place.value = json.places[0]["place name"];
      region.value = json.places[0]["state abbreviation"];
      postalCodeRO.value = json["post code"];
      postalCode.value = "";
    })
    .catch(error => {
      alert("Error: The zip code and/or country are incorrect.");
      console.error('There was a problem with the fetch operation:', error);
      postalCode.value = "";
      postalCodeRO.value = "";
    })
    .finally(() => {
      // To prevent an endless loop for error message
      postalCode.focus();
      isAlertActive = false;
    });
};

country.onclick = function() {
  postalCode.value = "";
  place.value = "";
  region.value = "";
  postalCodeRO.value = "";
};

country.onchange = function() {
  postalCode.value = "";
  place.value = "";
  region.value = "";
  postalCodeRO.value = "";
}
