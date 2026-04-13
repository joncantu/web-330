"use strict";
/*    JavaScript 7th Edition
      Chapter 9
      Project 09-01

      Project to read field.textContents from session storage
      Author: Jonathan Cantu
      Date:   April 12, 2026

      Filename: project09-02b.js
*/

/* Page Objects */

let riderNameCell = document.getElementById("riderName");
let ageGroupCell = document.getElementById("ageGroup");
let bikeOptionCell = document.getElementById("bikeOption");
let routeOptionCell = document.getElementById("routeOption");
let accOptionCell = document.getElementById("accOption");
let regionCell = document.getElementById("region");
let milesCell = document.getElementById("miles");
let commentsCell = document.getElementById("comments");

riderName.textContent = sessionStorage.getItem("riderName") || "Not Provided";
ageGroup.textContent = sessionStorage.getItem("ageGroup") || "Not Provided";
bikeOption.textContent = sessionStorage.getItem("bikeOption") || "Not Provided";
routeOption.textContent = sessionStorage.getItem("routeOption") || "Not Provided";
accOption.textContent = sessionStorage.getItem("accOption") || "Not Provided";
region.textContent = sessionStorage.getItem("region") || "Not Provided";
miles.textContent = sessionStorage.getItem("miles") || "Not Provided";
comments.textContent = sessionStorage.getItem("comments") || "Not Provided";

sessionStorage.clear();
