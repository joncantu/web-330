"use strict";
/*    JavaScript 7th Edition
      Chapter 8
      Project 08-01

      Project to create a timer object
      Author: Jonathan Cantu
      Date:   March 29, 2026

      Filename: project08-01.js
*/

/*--------------- Object Code --------------------*/
function timer(min, sec) {
  this.minutes = Number(min);
  this.seconds = Number(sec);
  this.timeID = null;
}

/* Interface Objects */
let minBox = document.getElementById("minutesBox");
let secBox = document.getElementById("secondsBox");
let runPauseTimer = document.getElementById("runPauseButton");

timer.prototype.runPause = function(minBox, secBox) {
  let timerObj = this;

  function countdown() {
    {
      if (timerObj.seconds === 0) {
        if (timerObj.minutes === 0) {
          clearInterval(timerObj.timeID);
          timerObj.timeID = null;
          alert("Time's up!");
        } else {
          timerObj.minutes--;
          timerObj.seconds = 59;
        }
      } else {
        timerObj.seconds--;
      }
      minBox.value = timerObj.minutes;
      secBox.value = timerObj.seconds;
    }
  }
  if (this.timeID === null) {
    this.timeID = window.setInterval(countdown, 1000);
  } else {
    clearInterval(this.timeID);
    this.timeID = null;
  }
}

let myTimer = new timer(minBox.value, secBox.value);

minBox.addEventListener("change", function () {
  myTimer.minutes = Number(minBox.value);
});

secBox.addEventListener("change", function () {
  myTimer.seconds = Number(secBox.value);
});

runPauseTimer.addEventListener("click", function () {
  myTimer.runPause(minBox, secBox);
});


/*---------------Interface Code -----------------*/
