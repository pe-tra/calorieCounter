const calorieCounter = document.getElementById("calorie-counter");
const budgetNumberInput = document.getElementById("budget");
const entryDropdown = document.getElementById("entry-dropdown");
const addEntryButton = document.getElementById("add-entry");
const clearButton = document.getElementById("clear");
const output = document.getElementById("output");
let isError = false;

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, "");
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function addEntry() {
  const targetInputContainer = document.querySelector(
    `#${entryDropdown.value} .input-container`
  );
  const entryNumber =
    targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
  const HTMLString = `
  <label for="${entryDropdown.value}-${entryNumber}-name">Entry ${entryNumber}</label>
  <input type="text" id="${entryDropdown.value}-${entryNumber}-name" placeholder="Name" />
  <input
    type="number"
    min="0"
    id="${entryDropdown.value}-${entryNumber}-calories"
    placeholder="Calories"
  />`;
  targetInputContainer.insertAdjacentHTML("beforeend", HTMLString);
}

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const breakfastNumberInputs = document.querySelectorAll(
    "#breakfast input[type='number']"
  );
  const lunchNumberInputs = document.querySelectorAll(
    "#lunch input[type='number']"
  );
  const dinnerNumberInputs = document.querySelectorAll(
    "#dinner input[type='number']"
  );
  const snacksNumberInputs = document.querySelectorAll(
    "#snacks input[type='number']"
  );
  const exerciseNumberInputs = document.querySelectorAll(
    "#exercise input[type='number']"
  );

  const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
  const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
  const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
  const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
  const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

  if (isError) {
    return;
  }

  const consumedCalories =
    breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
  const remainingCalories =
    budgetCalories - consumedCalories + exerciseCalories;
  const surplusOrDeficit = remainingCalories < 0 ? "Surplus" : "Deficit";
  output.innerHTML = `
  <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(
    remainingCalories
  )} Calorie ${surplusOrDeficit}</span>
  <hr>
  <p>${budgetCalories} Calories Budgeted</p>
  <p>${consumedCalories} Calories Consumed</p>
  <p>${exerciseCalories} Calories Burned</p>
  `;

  output.classList.remove("hide");

  renderCalorieChart(
    breakfastCalories,
    lunchCalories,
    dinnerCalories,
    snacksCalories,
    exerciseCalories
  );
}

function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Invalid Input: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  const inputContainers = Array.from(
    document.querySelectorAll(".input-container")
  );

  for (const container of inputContainers) {
    container.innerHTML = "";
  }

  budgetNumberInput.value = "";
  output.innerText = "";
  output.classList.add("hide");
}

addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm);

document.getElementById("save-entry").addEventListener("click", saveEntries);

// Save to localStorage
function saveEntries() {
  const data = {
    budget: budgetNumberInput.value,
    breakfast: getEntriesData("#breakfast .input-container"),
    lunch: getEntriesData("#lunch .input-container"),
    dinner: getEntriesData("#dinner .input-container"),
    snacks: getEntriesData("#snacks .input-container"),
    exercise: getEntriesData("#exercise .input-container"),
  };

  localStorage.setItem("calorieData", JSON.stringify(data));
  alert("Entries saved successfully!");
}

// Load from localStorage
function loadEntries() {
  const savedData = JSON.parse(localStorage.getItem("calorieData"));
  if (savedData) {
    budgetNumberInput.value = savedData.budget;

    setEntriesData("#breakfast .input-container", savedData.breakfast);
    setEntriesData("#lunch .input-container", savedData.lunch);
    setEntriesData("#dinner .input-container", savedData.dinner);
    setEntriesData("#snacks .input-container", savedData.snacks);
    setEntriesData("#exercise .input-container", savedData.exercise);
  }
}

function getEntriesData(containerSelector) {
  const inputs = document.querySelectorAll(`${containerSelector} input`);
  const data = [];

  for (let i = 0; i < inputs.length; i += 2) {
    const nameInput = inputs[i];
    const caloriesInput = inputs[i + 1];

    data.push({
      name: nameInput.value,
      calories: caloriesInput.value,
    });
  }

  return data;
}

function setEntriesData(containerSelector, data) {
  const container = document.querySelector(containerSelector);

  if (data && data.length > 0) {
    data.forEach((entry, index) => {
      const entryNumber = index + 1;
      const HTMLString = `
          <label for="entry-${entryNumber}-name">Entry ${entryNumber}</label>
          <input type="text" id="entry-${entryNumber}-name" value="${entry.name}" placeholder="Name" />
          <input type="number" min="0" id="entry-${entryNumber}-calories" value="${entry.calories}" placeholder="Calories" />
        `;
      container.insertAdjacentHTML("beforeend", HTMLString);
    });
  }
}

function renderCalorieChart(
  breakfastCalories,
  lunchCalories,
  dinnerCalories,
  snacksCalories,
  exerciseCalories
) {
  const ctx = document.getElementById("calorieChart").getContext("2d");

  // Destroy previous chart
  if (window.myChart) {
    window.myChart.destroy();
  }

  // Create the Pie Chart
  window.myChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Breakfast", "Lunch", "Dinner", "Snacks", "Exercise"],
      datasets: [
        {
          data: [
            breakfastCalories,
            lunchCalories,
            dinnerCalories,
            snacksCalories,
            exerciseCalories,
          ],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `${tooltipItem.label}: ${tooltipItem.raw} calories`;
            },
          },
        },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", loadEntries);
