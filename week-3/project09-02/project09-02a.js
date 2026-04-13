"use strict";
/*    JavaScript 7th Edition
      Chapter 9
      Project 09-02

      Project to read fields from web storage
      Author: Jonathan Cantu
      Date:   April 12, 2026

      Filename: project09-02a.js
*/

let riderName = document.getElementById("riderName");
let ageGroup = document.getElementById("ageGroup");
let bikeOption = document.getElementById("bikeOption");
let routeOption = document.getElementById("routeOption");
let accOption = document.getElementById("accOption");
let region = document.getElementById("region");
let miles = document.getElementById("miles");
let comments = document.getElementById("comments");

function showData() {

    sessionStorage.setItem("riderName", riderName.value);
    sessionStorage.setItem("ageGroup", ageGroup.value);
    sessionStorage.setItem("bikeOption", bikeOption.value);
    sessionStorage.setItem("routeOption", routeOption.value);
    sessionStorage.setItem("accOption", accOption.value);
    sessionStorage.setItem("region", region.value);
    sessionStorage.setItem("miles", miles.value);
    sessionStorage.setItem("comments", comments.value);

    document.location.href = "project09-02b.html";
    console.log("Data stored in web storage and navigating to display page.");
    console.log("Rider Name: " + sessionStorage.getItem("riderName"));
    console.log("Age Group: " + sessionStorage.getItem("ageGroup"));
    console.log("Bike Option: " + sessionStorage.getItem("bikeOption"));
    console.log("Route Option: " + sessionStorage.getItem("routeOption"));
    console.log("Accommodation Option: " + sessionStorage.getItem("accOption"));
    console.log("Region: " + sessionStorage.getItem("region"));
    console.log("Miles: " + sessionStorage.getItem("miles"));
    console.log("Comments: " + sessionStorage.getItem("comments"));
}

document.getElementById("submitButton").addEventListener("click", function() {
  showData();
});

