"use strict";

/*
  Pragmatic JavaScript
  Chapter 2
  Programming Assignment

  Author: Jonathan Cantu
  Date:   April 25, 2026
  Filename: script.js
*/

// In-memory object array for each table
let tables = [
  { tableNumber: 1, capacity: 2, isReserved: false },
  { tableNumber: 2, capacity: 2, isReserved: false },
  { tableNumber: 3, capacity: 4, isReserved: false },
  { tableNumber: 4, capacity: 4, isReserved: false },
  { tableNumber: 5, capacity: 6, isReserved: false },
  { tableNumber: 6, capacity: 6, isReserved: true }, // Pre-reserved for demo
  { tableNumber: 7, capacity: 8, isReserved: false },
  { tableNumber: 8, capacity: 8, isReserved: false },
];

function updateTableDropdown() {
  const selectElement = document.getElementById('tableSelect');
  const currentValue = selectElement.value;

  selectElement.innerHTML = '<option value="">-- Select a table --</option>';

  tables.forEach(table => {
    const option = document.createElement('option');
    option.value = table.tableNumber;
    option.textContent = `Table ${table.tableNumber}
    (Capacity: ${table.capacity})${table.isReserved ? ' - Reserved' : ' - Available'}`;
    option.disabled = table.isReserved;
    selectElement.appendChild(option);
  });

  if (currentValue) {
    const option = selectElement.querySelector(`option[value="${currentValue}"]`);
    if (option && !option.disabled) {
      selectElement.value = currentValue;
    }
  }
}

function reserveTable(tableNumber, callback, time = 2000) {
  const table = tables.find(t => t.tableNumber === parseInt(tableNumber));

  if (!table) {
    callback(`Error: Table ${tableNumber} does not exist.`);
    return;
  }

  if (table.isReserved) {
    callback(`Sorry, Table ${tableNumber} is already reserved. Please choose another table.`);
    return;
  }

  table.isReserved = true;

  setTimeout(() => {
    callback(`Success! Table ${tableNumber} has been reserved for you. Enjoy your meal!`);
  }, time);
}

document.getElementById('reservationForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const tableNumber = document.getElementById('tableSelect').value;
  const messageElement = document.getElementById('message');
  const submitButton = this.querySelector('input[type="submit"]');

  messageElement.className = '';
  messageElement.textContent = '';

  if (!name) {
    messageElement.textContent = 'Please enter your name.';
    messageElement.className = 'error';
    return;
  }

  if (!tableNumber) {
    messageElement.textContent = 'Please select a table number.';
    messageElement.className = 'error';
    return;
  }

  submitButton.disabled = true;
  submitButton.value = 'Reserving...';

  reserveTable(tableNumber, (message) => {

    messageElement.textContent = message;

    if (message.includes('Success')) {
      messageElement.className = 'success';
    } else {
      messageElement.className = 'error';
    }

    submitButton.disabled = false;
    submitButton.value = 'Reserve';
    updateTableDropdown();

    if (message.includes('Success')) {
      messageElement.classList.add('success');

      messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 2000); // 2 second delay for demo
});

(function initializeForm() {
  const form = document.getElementById('reservationForm');
  const tableNumberInput = document.getElementById('tableNumber');
  const messageElement = document.getElementById('message');

  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'form-group';

  const label = document.createElement('label');
  label.setAttribute('for', 'tableSelect');
  label.textContent = 'Table Number:';

  const select = document.createElement('select');
  select.id = 'tableSelect';
  select.name = 'tableNumber';
  select.required = true;

  selectWrapper.appendChild(label);
  selectWrapper.appendChild(select);

  tableNumberInput.parentNode.replaceChild(selectWrapper, tableNumberInput);

  updateTableDropdown();

  messageElement.textContent = 'Enter your name and select an available table to reserve.';
  messageElement.className = 'info';
})();
