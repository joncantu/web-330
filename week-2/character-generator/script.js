/*
  Pragmatic JavaScript
  Chapter 1
  Programming Assignment

  Author: Jonathan Cantu
  Date:   April 5, 2026
  Filename: script.js
*/

"use strict";

const form = document.getElementById("characterForm");

function createCharacter(name, gender, characterClass) {
  let characterName = name;
  let characterGender = gender;
  let characterClassType = characterClass;

  return {
    getName: function() {
      return characterName;
    },
    getGender: function() {
      return characterGender;
    },
    getClass: function() {
      return characterClassType;
    }
  };
}

function displayCharacter(character) {
  const outputDiv = document.getElementById("characterOutput");
  outputDiv.innerHTML = `
    <h2>Character Details</h2>
    <p><label>NAME:</label> ${character.getName()}</p>
    <p><label>GENDER:</label> ${character.getGender()}</p>
    <p><label>CLASS:</label> ${character.getClass()}</p>
  `;
}

document.getElementById("generateHero").addEventListener("click", function(e) {
  e.preventDefault();

  const name = document.getElementById("heroName").value;
  const gender = document.getElementById("heroGender").value;
  const characterClass = document.getElementById("heroClass").value;

  const character = createCharacter(name, gender, characterClass);

  displayCharacter(character);

});
