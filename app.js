// App State
let people = []; // Structure: { name: string, moveInDate: string }
let expenses = []; // Structure: { id, desc, amount, payer, date, splitType, shares: { personName: amount } }
let currencySymbol = '₹';
let activePayment = null;

// DOM Elements & Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  // Set default today's date in all date inputs
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => input.value = today);
});

const navTabs = document.querySelectorAll('.nav-tab');
const viewSections = document.querySelectorAll('.view-section');
const navSummary = document.getElementById('nav-active-summary');
const resetBtn = document.getElementById('reset-all-btn');
const currencySelect = document.getElementById('currency-select');

// Tab Switching
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.getAttribute('data-target');

    navTabs.forEach(t => t.classList.remove('active'));
    viewSections.forEach(v => v.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(targetId).classList.add('active');
  });
});

// Currency Switcher
currencySelect.addEventListener('change', (e) => {
  currencySymbol = e.target.value;
  renderHistory();
  recalculate();
});

// Reset Handler
resetBtn.addEventListener('click', () => {
  if (people.length === 0 && expenses.length === 0) return;
  if (confirm('Are you sure you want to reset all data?')) {
    people = [];
    expenses = [];
    updatePeopleUI();
    renderHistory();
    recalculate();
  }
});

function updateNavbar() {
  navSummary.textContent = `${people.length} People • ${expenses.length} Expenses`;
}

// Add Person Forms
document.querySelectorAll('.add-person-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('.person-name-input');
    const moveInInput = form.querySelector('.person-movein-input');
    const name = nameInput.value.trim();
    const moveInDate = moveInInput.value;

    if (name && !people.some(p => p.name === name)) {
      people.push({ name, moveInDate });
      document.querySelectorAll('.person-name-input').forEach(i => (i.value = ''));
      updatePeopleUI();
      recalculate();
    }
  });
});

// Remove Person
window.removePerson = function(name) {
  people = people.filter(p => p.name !== name);
  expenses = expenses.filter(e => e.payer !== name);
  expenses.forEach(e => {
    delete e.shares[name];
  });
  expenses = expenses.filter(e => Object.keys(e.shares).length > 0);

  updatePeopleUI();
  renderHistory();
  recalculate();
};

// Delete Single Expense Entry
window.deleteExpense = function(id) {
  expenses = expenses.filter(e => e.id !== id);
  renderHistory();
  recalculate();
};

window.toggleSplitPill = function(labelEl) {
  const checkbox = labelEl.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  const targetPill = labelEl.closest('.split-pill');
  targetPill.classList.toggle('active', checkbox.checked);

  const shareInput = targetPill.querySelector('.unequal-share-input');
  if (shareInput) {
    shareInput.style.display = checkbox.checked ? 'inline-block' : 'none';
  }
};

// Toggle Select All/None for all split sections
document.querySelectorAll('.toggle-all-split').forEach(btn => {
  btn.addEventListener('click', () => {
    const allCheckboxes = document.querySelectorAll('.split-checkbox-group input[type="checkbox"]');
    const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);

    allCheckboxes.forEach(cb => {
      cb.checked = !allChecked;
      const pill = cb.closest('.split-pill');
      pill.classList.toggle('active', !allChecked);
      const shareInput = pill.querySelector('.unequal-share-input');
      if (shareInput) shareInput.style.display = !allChecked ? 'inline-block' : 'none';
    });

    document.querySelectorAll('.toggle-all-split').forEach(b => {
      b.textContent = allChecked ? 'Select all' : 'Deselect all';
    });
  });
});

// Handle Split Type Input Changes
document.querySelectorAll('.split-type-select').forEach(select => {
  select.addEventListener('change', () => {
    updatePeopleUI();
  });
});

function updatePeopleUI() {
  document.querySelectorAll('.people-count-badge').forEach(b => {
    b.textContent = `${people.length} people`;
  });
  updateNavbar();

  const emptyStates = document.querySelectorAll('.people-empty');
  const chipContainers = document.querySelectorAll('.people-chips-container');
  const payerSelects = document.querySelectorAll('.expense-payer-select');
  const splitEmpties = document.querySelectorAll('.split-empty-indicator');
  const splitGroups = document.querySelectorAll('.split-checkboxes-target');
  const toggleBtns = document.querySelectorAll('.toggle-all-split');

  if (people.length === 0) {
    emptyStates.forEach(el => (el.style.display = 'flex'));
    chipContainers.forEach(el => (el.style.display = 'none'));

    payerSelects.forEach(select => {
      select.innerHTML = '<option value="" disabled selected>Add people first</option>';
      select.disabled = true;
    });

    splitEmpties.forEach(el => (el.style.display = 'block'));
    splitGroups.forEach(el => (el.style.display = 'none'));
    toggleBtns.forEach(el => (el.style.display = 'none'));
  } else {
    emptyStates.forEach(el => (el.style.display = 'none'));
    chipContainers.forEach(el => {
      el.style.display = 'flex';
      el.innerHTML = people.map(p => `
        <span class="chip">
          ${p.name} <small style="color:var(--text-muted)">(Entry: ${p.moveInDate})</small>
          <span class="chip-remove" onclick="removePerson('${p.name}')">&times;</span>
        </span>
      `).join('');
    });

    payerSelects.forEach(select => {
      select.disabled = false;
      select.innerHTML = '<option value="" disabled selected>Select payer</option>' +
        people.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    });

    splitEmpties.forEach(el => (el.style.display = 'none'));
    
    // Render dynamic split fields based on split type selection
    const currentSplitType = document.querySelector('.split-type-select')?.value || 'equal';

    splitGroups.forEach(el => {
      el.style.display = 'flex';
      el.innerHTML = people.map(p => `
        <label class="split-pill active" onclick="toggleSplitPill(this); event.stopPropagation();">
          <input type="checkbox" value="${p.name}" checked />
          <span>${p.name}</span>
          ${
            currentSplitType !== 'equal' 
              ? `<input type="number" class="unequal-share-input" data-person="${p.name}" placeholder="${currentSplitType === 'percentage' ? '%' : currencySymbol}" step="0.01" style="width: 60px; margin-left: 5px; padding: 2px 5px;" onclick="event.stopPropagation();" />`
              : ''
          }
        </label>
      `).join('');
    });

    toggleBtns.forEach(el => {
      el.style.display = 'inline-block';
      el.textContent = 'Deselect all';
    });
  }
}

// Expense Form Submissions
document.querySelectorAll('.expense-entry-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = form.querySelector('.expense-desc-input').value.trim();
    const amount = parseFloat(form.querySelector('.expense-amount-input').value);
    const payer = form.querySelector('.expense-payer-select').value;
    const date = form.querySelector('.expense-date-input').value;
    const splitType = form.querySelector('.split-type-select').value;

    const checkedBoxes = Array.from(form.querySelectorAll('.split-checkbox-group input[type="checkbox"]:checked'));
    if (!desc || isNaN(amount) || !payer || !date) return;

    if (checkedBoxes.length === 0) {
      alert('Please select at least one person to split this expense with.');
      return;
    }

    const shares = {};

    if (splitType === 'equal') {
      const splitAmount = amount / checkedBoxes.length;
      checkedBoxes.forEach(cb => { shares[cb.value] = splitAmount; });
    } else if (splitType === 'unequal') {
      let totalAssigned = 0;
      for (let cb of checkedBoxes) {
        const val = parseFloat(form.querySelector(`.unequal-share-input[data-person="${cb.value}"]`)?.value || 0);
        shares[cb.value] = val;
        totalAssigned += val;
      }
      if (Math.abs(totalAssigned - amount) > 0.01) {
        alert(`Unequal share total (${currencySymbol}${totalAssigned.toFixed(2)}) must equal total expense amount (${currencySymbol}${amount.toFixed(2)}).`);
        return;
      }
    } else if (splitType === 'percentage') {
      let totalPct = 0;
      for (let cb of checkedBoxes) {
        const pct = parseFloat(form.querySelector(`.unequal-share-input[data-person="${cb.value}"]`)?.value || 0);
        shares[cb.value] = (pct / 100) * amount;
        totalPct += pct;
      }
      if (Math.abs(totalPct - 100) > 0.01) {
        alert(`Total percentage shares must sum to 100%. Current total: ${totalPct}%`);
        return;
      }
    }

    expenses.push({ id: Date.now(), desc, amount, payer, date, splitType, shares });
    document.querySelectorAll('.expense-desc-input').forEach(i => (i.value = ''));
    document.querySelectorAll('.expense-amount-input').forEach(i => (i.value = ''));

    renderHistory();
    recalculate();
  });
});

function renderHistory() {
  document.querySelectorAll('.expense-count-badge').forEach(b => {
    b.textContent = `${expenses.length} logged`;
  });
  updateNavbar();

  const emptyStates = document.querySelectorAll('.history-empty');
  const historyLists = document.querySelectorAll('.history-list-container');

  if (expenses.length === 0) {
    emptyStates.forEach(el => (el.style.display = 'flex'));
    historyLists.forEach(el => (el.style.display = 'none'));
  } else {
    emptyStates.forEach(el => (el.style.display = 'none'));
    const html = expenses.map(e => {
      const participants = Object.keys(e.shares).join(', ');
      return `
        <li class="list-row">
          <div>
            <strong>${e.desc}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted)">
              Date: ${e.date} • Paid by ${e.payer} • Split (${Object.keys(e.shares).length}): ${participants}
            </div>
          </div>
          <div class="expense-right-meta">
            <strong style="color: var(--text-main);">${currencySymbol}${e.amount.toFixed(2)}</strong>
            <button type="button" class="btn-delete-expense" onclick="deleteExpense(${e.id})" title="Delete expense">&times;</button>
          </div>
        </li>
      `;
    }).join('');

    historyLists.forEach(el => {
      el.style.display = 'flex';
      el.innerHTML = html;
    });
  }
}

// Balance Calculation & Debt Minimization
function recalculate() {
  const balanceEmpties = document.querySelectorAll('.balance-empty');
  const balanceLists = document.querySelectorAll('.balance-list-container');
  const settlementEmpties = document.querySelectorAll('.settlement-empty');
  const settlementLists = document.querySelectorAll('.settlement-list-container');
  const settlementBadges = document.querySelectorAll('.settlement-count-badge');

  if (people.length === 0 || expenses.length === 0) {
    balanceEmpties.forEach(el => (el.style.display = 'flex'));
    balanceLists.forEach(el => (el.style.display = 'none'));
    settlementEmpties.forEach(el => {
      el.style.display = 'flex';
      el.querySelector('span:last-child').textContent = 'Add an expense to see the plan.';
    });
    settlementLists.forEach(el => (el.style.display = 'none'));
    settlementBadges.forEach(b => (b.textContent = '0 payments'));
    return;
  }

  const balances = {};
  people.forEach(p => (balances[p.name] = 0));

  expenses.forEach(e => {
    balances[e.payer] = (balances[e.payer] || 0) + e.amount;
    for (let [person, share] of Object.entries(e.shares)) {
      balances[person] = (balances[person] || 0) - share;
    }
  });

  const balanceHTML = Object.entries(balances).map(([person, amt]) => {
    const isPos = amt >= 0.005;
    const formatted = Math.abs(amt).toFixed(2);
    return `
      <li class="list-row">
        <span>${person}</span>
        <span class="${isPos ? 'balance-positive' : 'balance-negative'}">
          ${isPos ? '+' : '-'}${currencySymbol}${formatted}
        </span>
      </li>
    `;
  }).join('');

  balanceEmpties.forEach(el => (el.style.display = 'none'));
  balanceLists.forEach(el => {
    el.style.display = 'flex';
    el.innerHTML = balanceHTML;
  });

  let debtors = [];
  let creditors = [];

  for (const [person, balance] of Object.entries(balances)) {
    if (balance < -0.01) debtors.push({ person, amount: -balance });
    else if (balance > 0.01) creditors.push({ person, amount: balance });
  }

  const settlements = [];
  let d = 0, c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const payment = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.person,
      to: creditor.person,
      amount: payment
    });

    debtor.amount -= payment;
    creditor.amount -= payment;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  settlementBadges.forEach(b => (b.textContent = `${settlements.length} payments`));

  if (settlements.length === 0) {
    settlementEmpties.forEach(el => {
      el.style.display = 'flex';
      el.querySelector('span:last-child').textContent = 'Everyone is all square!';
    });
    settlementLists.forEach(el => (el.style.display = 'none'));
  } else {
    const settlementHTML = settlements.map((s, idx) => `
      <div class="settle-row">
        <span><b>${s.from}</b> pays <b>${s.to}</b></span>
        <div>
          <span class="settle-amount" style="margin-right: 8px;">${currencySymbol}${s.amount.toFixed(2)}</span>
          <button type="button" class="btn-lime" style="display:inline-block; padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="openPaymentGateway('${s.from}', '${s.to}', ${s.amount.toFixed(2)})">Settle Now</button>
        </div>
      </div>
    `).join('');

    settlementEmpties.forEach(el => (el.style.display = 'none'));
    settlementLists.forEach(el => {
      el.style.display = 'flex';
      el.innerHTML = settlementHTML;
    });
  }
}

// PAYMENT GATEWAY MODAL HANDLERS
window.openPaymentGateway = function(from, to, amount) {
  activePayment = { from, to, amount };
  document.getElementById('payment-details-text').innerText = `${from} paying ${to} ${currencySymbol}${amount}`;
  document.getElementById('payment-modal').style.display = 'flex';
};

window.closePaymentModal = function() {
  document.getElementById('payment-modal').style.display = 'none';
  activePayment = null;
};

document.getElementById('confirm-pay-btn').addEventListener('click', () => {
  if (!activePayment) return;
  alert(`Payment of ${currencySymbol}${activePayment.amount} from ${activePayment.from} to ${activePayment.to} was successful!`);
  
  // Log compensatory expense settlement transaction
  expenses.push({
    id: Date.now(),
    desc: `Settlement: ${activePayment.from} to ${activePayment.to}`,
    amount: parseFloat(activePayment.amount),
    payer: activePayment.from,
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
    shares: { [activePayment.to]: parseFloat(activePayment.amount) }
  });

  closePaymentModal();
  renderHistory();
  recalculate();
});