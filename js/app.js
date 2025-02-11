let spendedArray = [], namesArray = [];

// Retrieve and parse data from localStorage
const getBoth = () => JSON.parse(localStorage.getItem("Both")) || { expenseName: [], expenseAmount: [] };

// Toggle Chart Display
function toggleChart() {
  let chartImg = document.querySelector("#chartcontrol > img");
  let chart = document.querySelector("#chart");
  let width = document.querySelector("#width");
  let isHidden = chartImg.getAttribute("data-id") == 1;

  chart.style.display = isHidden ? "none" : "block";
  width.classList.toggle("lowerwidth", isHidden);
  chartImg.style.marginRight = isHidden ? "2.20em" : "";
  chartImg.setAttribute("data-id", isHidden ? 0 : 1);
  localStorage.setItem("ChartDisplay", isHidden ? "hide" : "show");

  if (!isHidden && getBoth().expenseAmount.length > 0) drawChart();
}

document.querySelector("#chartcontrol").addEventListener("click", toggleChart);

// Budget Class
class Budget {
  constructor(budget) {
    this.budget = this.budgetLeft = Number(budget);
  }
  subtract(amount) {
    return (this.budgetLeft -= amount);
  }
}

// HTML Manipulation
class UI {
  insertBudget(amount) {
    budgetAmount.innerHTML = `Your Budget is: ${amount.toLocaleString()} Dollars`;
    budgetTotal.textContent = amount.toLocaleString();
    document.querySelector("input[name=budget]").value = amount;
  }

  insertExpense(amount, name) {
    let li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between");
    li.innerHTML = `
      <text-area class='amount' contentEditable='true'>$${amount.toLocaleString()}</text-area>
      <text-area class='badge badge-primary' contentEditable='true'>${name}</text-area>
      <span class='remove'>X</span>
    `;
    expenses.appendChild(li);
  }
}

// Variables
const budgetEntry = document.querySelector(".amout input"),
  budgetAmount = document.querySelector(".budgetamount"),
  budgetTotal = document.querySelector("#total"),
  budgetLeft = document.querySelector("#left"),
  amount = document.querySelector("#amount"),
  form = document.querySelector("#add-expense"),
  expenseN = document.querySelector("#expense"),
  expenses = document.querySelector("#expenses"),
  reset = document.querySelector("#reset");
let userBudget, ui = new UI();

// Event Listeners
budgetEntry.addEventListener("blur", () => {
  userBudget = new Budget(budgetEntry.value);
  ui.insertBudget(userBudget.budget);
  localStorage.setItem("Budget", userBudget.budget);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let spended = Number(amount.value), name = expenseN.value;
  if (!spended) return;

  let both = getBoth();
  both.expenseAmount.push(spended);
  both.expenseName.push(name);
  localStorage.setItem("Both", JSON.stringify(both));

  ui.insertExpense(spended, name);
  budgetLeft.textContent = userBudget.subtract(spended).toLocaleString();
  drawChart();
});

expenses.addEventListener("click", (e) => {
  if (!e.target.classList.contains("remove")) return;

  let both = getBoth();
  let index = [...e.target.parentElement.parentElement.children].indexOf(e.target.parentElement);

  both.expenseAmount.splice(index, 1);
  both.expenseName.splice(index, 1);
  localStorage.setItem("Both", JSON.stringify(both));
  e.target.parentElement.remove();
  updateBudgetLeft();
  drawChart();
});

function updateBudgetLeft() {
  let both = getBoth(), totalSpent = both.expenseAmount.reduce((a, b) => a + b, 0);
  budgetLeft.textContent = (localStorage.getItem("Budget") - totalSpent).toLocaleString();
}

function drawChart() {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(() => {
    let data = google.visualization.arrayToDataTable([
      ["Expense", "Amount"],
      ...getBoth().expenseAmount.map((amt, i) => [getBoth().expenseName[i], amt]),
    ]);
    new google.visualization.PieChart(document.querySelector("#piechart_3d"))
      .draw(data, { is3D: true, backgroundColor: "transparent" });
  });
}

reset.addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset everything?")) return;
  localStorage.clear();
  location.reload();
});

// Initialize
(function init() {
  let budget = localStorage.getItem("Budget");
  if (budget) ui.insertBudget(budget);

  let both = getBoth();
  both.expenseAmount.forEach((amt, i) => ui.insertExpense(amt, both.expenseName[i]));
  updateBudgetLeft();
  drawChart();
})();
