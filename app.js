// Database Configuration
const DB_NAME = 'SplitlyDB';
const DB_VERSION = 1;
let db = null;

// App State
let people = [];
let expenses = [];
let currencySymbol = '₹';
let activePayment = null;
let currentLang = 'en';

// Comprehensive Translations Dictionary
const translations = {
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_expenses: "Expenses",
    nav_roommates: "Roommates",
    nav_settings: "Settings",
    
    // Titles & Sections
    title_people: "People & Move-in Dates",
    empty_people: "Add people to start splitting.",
    label_movein: "Move-in / Rental Entry Date",
    btn_add_roommate: "+ Add Roommate",
    title_glance: "At a glance",
    empty_balances: "Balances will appear here.",
    title_settle: "Settle up",
    sub_settle: "The fewest payments needed to make everyone square.",
    empty_settle: "Add an expense to see the plan.",
    title_add_expense: "Add an expense",
    label_description: "Description",
    label_amount: "Amount",
    label_paid_by: "Paid by",
    label_expense_date: "Rental / Expense Date",
    label_split_type: "Split Type",
    label_split_between: "Split between",
    msg_add_people_split: "Add people above to split expenses",
    btn_add_expense: "Add expense →",
    title_history: "Expense history",
    empty_history: "No expenses yet — make the first move.",
    title_manage_roommates: "Manage Roommates",
    sub_manage_roommates: "Add or remove members participating in rental expenses.",
    empty_roommates: "No roommates added yet.",
    label_roommate_name: "Roommate Name",
    sub_settings: "Customize group currency preferences.",
    label_currency: "Display Currency",
    title_reset: "Reset All Data",
    sub_reset: "Permanently remove all registered roommates and expenses.",
    btn_clear_all: "Clear All",

    // Auth & Modals
    auth_welcome: "Welcome to Splitly",
    sign_in: "Sign In",
    sign_up: "Sign Up",
    email: "Email",
    password: "Password",
    full_name: "Full Name",
    create_account: "Create Account",
    logged_in: "Successfully logged in!",
    signed_up: "Account created successfully!",
    
    // Dynamic Labels & Actions
    select_all: "Select all",
    deselect_all: "Deselect all",
    settle_now: "Settle Now",
    pays: "pays",
    live: "Live",
    people_unit: "people",
    payments_unit: "payments",
    logged_unit: "logged",
    select_payer: "Select payer",
    add_people_first: "Add people first",
    entry_date: "Entry",
    all_square: "Everyone is all square!",
    date: "Date",
    paid_by: "Paid by",
    split: "Split",
    delete_confirm: "Are you sure you want to reset all data?",
    payment_success: "Payment successful!",
    
    // Dynamic Split Options
    equal_split: "Equal (=)",
    unequal_split: "Unequal (Exact Amounts)",
    percentage_split: "Percentage (%)"
  },
  hi: {
    // Navigation
    nav_dashboard: "डैशबोर्ड",
    nav_expenses: "खर्च",
    nav_roommates: "कमरे के साथी",
    nav_settings: "सेटिंग्स",
    
    // Titles & Sections
    title_people: "लोग और प्रवेश तिथियां",
    empty_people: "विभाजन शुरू करने के लिए लोगों को जोड़ें।",
    label_movein: "प्रवेश / किराया प्रवेश तिथि",
    btn_add_roommate: "+ साथी जोड़ें",
    title_glance: "एक नज़र में",
    empty_balances: "शेष राशि यहाँ दिखाई देगी।",
    title_settle: "हिसाब चुकता करें",
    sub_settle: "सबका हिसाब बराबर करने के लिए न्यूनतम भुगतान।",
    empty_settle: "योजना देखने के लिए एक खर्च जोड़ें।",
    title_add_expense: "खर्च जोड़ें",
    label_description: "विवरण",
    label_amount: "राशि",
    label_paid_by: "भुगतानकर्ता",
    label_expense_date: "किराया / खर्च की तिथि",
    label_split_type: "विभाजन का प्रकार",
    label_split_between: "इनके बीच बांटें",
    msg_add_people_split: "खर्च बांटने के लिए ऊपर लोगों को जोड़ें",
    btn_add_expense: "खर्च जोड़ें →",
    title_history: "खर्च का इतिहास",
    empty_history: "अभी तक कोई खर्च नहीं है।",
    title_manage_roommates: "साथियों का प्रबंधन करें",
    sub_manage_roommates: "किराए के खर्चों में शामिल सदस्यों को जोड़ें या हटाएं।",
    empty_roommates: "अभी तक कोई साथी नहीं जोड़ा गया।",
    label_roommate_name: "साथी का नाम",
    sub_settings: "समूह मुद्रा प्राथमिकताओं को कस्टमाइज़ करें।",
    label_currency: "प्रदर्शित मुद्रा",
    title_reset: "सभी डेटा रीसेट करें",
    sub_reset: "सभी पंजीकृत साथियों और खर्चों को स्थायी रूप से हटाएं।",
    btn_clear_all: "सब साफ करें",

    // Auth & Modals
    auth_welcome: "स्प्लिटली में आपका स्वागत है",
    sign_in: "साइन इन करें",
    sign_up: "साइन अप करें",
    email: "ईमेल",
    password: "पासवर्ड",
    full_name: "पूरा नाम",
    create_account: "खाता बनाएं",
    logged_in: "सफलतापूर्वक लॉग इन किया गया!",
    signed_up: "खाता सफलतापूर्वक बनाया गया!",
    
    // Dynamic Labels & Actions
    select_all: "सभी चुनें",
    deselect_all: "सभी हटाएं",
    settle_now: "अभी चुकाएं",
    pays: "देता है",
    live: "लाइव",
    people_unit: "लोग",
    payments_unit: "भुगतान",
    logged_unit: "दर्ज",
    select_payer: "भुगतानकर्ता चुनें",
    add_people_first: "पहले लोगों को जोड़ें",
    entry_date: "प्रवेश",
    all_square: "सभी का हिसाब बराबर है!",
    date: "तिथि",
    paid_by: "भुगतानकर्ता",
    split: "बंटवारा",
    delete_confirm: "क्या आप वाकई सारा डेटा रीसेट करना चाहते हैं?",
    payment_success: "भुगतान सफल रहा!",

    // Dynamic Split Options
    equal_split: "बराबर (=)",
    unequal_split: "असमान (सटीक राशि)",
    percentage_split: "प्रतिशत (%)"
  }
};

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      
      if (!dbInstance.objectStoreNames.contains('people')) {
        dbInstance.createObjectStore('people', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('expenses')) {
        dbInstance.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains('settings')) {
        dbInstance.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Database Helpers
function dbGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbAdd(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbDelete(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function dbClear(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function dbPut(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// DOM Elements & Initial Setup
document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => input.value = today);

  await initDB();
  await loadStateFromDB();
});

async function loadStateFromDB() {
  people = await dbGetAll('people');
  expenses = await dbGetAll('expenses');
  
  const savedCurrency = await dbGetAll('settings');
  const currencySetting = savedCurrency.find(s => s.key === 'currencySymbol');
  if (currencySetting) {
    currencySymbol = currencySetting.value;
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) currencySelect.value = currencySymbol;
  }

  updatePeopleUI();
  renderHistory();
  recalculate();
}

// --- LANGUAGE & AUTH SYSTEM ---

window.selectLanguage = function(lang) {
  currentLang = lang;
  applyTranslations(lang);

  document.getElementById('language-modal').style.display = 'none';
  openAuthModal();
};

function applyTranslations(lang) {
  const dict = translations[lang] || translations.en;
  
  // Standard Data-I18N text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Dynamic dropdown options for split type
  document.querySelectorAll('.split-type-select').forEach(select => {
    if (select.options[0]) select.options[0].text = dict.equal_split;
    if (select.options[1]) select.options[1].text = dict.unequal_split;
    if (select.options[2]) select.options[2].text = dict.percentage_split;
  });

  // Re-render UI elements to reflect language changes
  updatePeopleUI();
  renderHistory();
  recalculate();
}

window.openAuthModal = function() {
  document.getElementById('auth-modal').style.display = 'flex';
};

window.closeAuthModal = function() {
  document.getElementById('auth-modal').style.display = 'none';
};

window.switchAuthTab = function(type) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');

  if (type === 'login') {
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  }
};

window.handleAuthSubmit = function(event, type) {
  event.preventDefault();
  const dict = translations[currentLang] || translations.en;
  
  if (type === 'login') {
    alert(dict.logged_in);
  } else {
    alert(dict.signed_up);
  }

  closeAuthModal();
};

// --- CORE APP LOGIC ---

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
currencySelect.addEventListener('change', async (e) => {
  currencySymbol = e.target.value;
  await dbPut('settings', { key: 'currencySymbol', value: currencySymbol });
  renderHistory();
  recalculate();
});

// Reset Handler
resetBtn.addEventListener('click', async () => {
  const dict = translations[currentLang] || translations.en;
  if (people.length === 0 && expenses.length === 0) return;
  if (confirm(dict.delete_confirm)) {
    await dbClear('people');
    await dbClear('expenses');
    people = [];
    expenses = [];
    updatePeopleUI();
    renderHistory();
    recalculate();
  }
});

function updateNavbar() {
  const dict = translations[currentLang] || translations.en;
  navSummary.textContent = `${people.length} ${dict.people_unit} • ${expenses.length} ${dict.logged_unit}`;
}

// Add Person Forms
document.querySelectorAll('.add-person-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('.person-name-input');
    const moveInInput = form.querySelector('.person-movein-input');
    const name = nameInput.value.trim();
    const moveInDate = moveInInput.value;

    if (name && !people.some(p => p.name === name)) {
      const personData = { name, moveInDate };
      const generatedId = await dbAdd('people', personData);
      personData.id = generatedId;
      people.push(personData);

      document.querySelectorAll('.person-name-input').forEach(i => (i.value = ''));
      updatePeopleUI();
      recalculate();
    }
  });
});

// Remove Person
window.removePerson = async function(name) {
  const targetPerson = people.find(p => p.name === name);
  if (targetPerson) {
    await dbDelete('people', targetPerson.id);
  }

  people = people.filter(p => p.name !== name);

  const expensesToDelete = expenses.filter(e => e.payer === name);
  for (const exp of expensesToDelete) {
    await dbDelete('expenses', exp.id);
  }

  expenses = expenses.filter(e => e.payer !== name);

  for (const exp of expenses) {
    if (exp.shares[name]) {
      delete exp.shares[name];
      if (Object.keys(exp.shares).length === 0) {
        await dbDelete('expenses', exp.id);
      } else {
        await dbPut('expenses', exp);
      }
    }
  }

  expenses = expenses.filter(e => Object.keys(e.shares).length > 0);

  updatePeopleUI();
  renderHistory();
  recalculate();
};

// Delete Single Expense Entry
window.deleteExpense = async function(id) {
  await dbDelete('expenses', id);
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

// Toggle Select All/None
document.querySelectorAll('.toggle-all-split').forEach(btn => {
  btn.addEventListener('click', () => {
    const dict = translations[currentLang] || translations.en;
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
      b.textContent = allChecked ? dict.select_all : dict.deselect_all;
    });
  });
});

document.querySelectorAll('.split-type-select').forEach(select => {
  select.addEventListener('change', () => {
    updatePeopleUI();
  });
});

function updatePeopleUI() {
  const dict = translations[currentLang] || translations.en;

  document.querySelectorAll('.people-count-badge').forEach(b => {
    b.textContent = `${people.length} ${dict.people_unit}`;
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
      select.innerHTML = `<option value="" disabled selected>${dict.add_people_first}</option>`;
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
          ${p.name} <small style="color:var(--text-muted)">(${dict.entry_date}: ${p.moveInDate})</small>
          <span class="chip-remove" onclick="removePerson('${p.name}')">&times;</span>
        </span>
      `).join('');
    });

    payerSelects.forEach(select => {
      select.disabled = false;
      select.innerHTML = `<option value="" disabled selected>${dict.select_payer}</option>` +
        people.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    });

    splitEmpties.forEach(el => (el.style.display = 'none'));
    
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
      el.textContent = dict.deselect_all;
    });
  }
}

// Expense Form Submissions
document.querySelectorAll('.expense-entry-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
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

    const newExpense = { desc, amount, payer, date, splitType, shares };
    const generatedId = await dbAdd('expenses', newExpense);
    newExpense.id = generatedId;

    expenses.push(newExpense);

    document.querySelectorAll('.expense-desc-input').forEach(i => (i.value = ''));
    document.querySelectorAll('.expense-amount-input').forEach(i => (i.value = ''));

    renderHistory();
    recalculate();
  });
});

function renderHistory() {
  const dict = translations[currentLang] || translations.en;

  document.querySelectorAll('.expense-count-badge').forEach(b => {
    b.textContent = `${expenses.length} ${dict.logged_unit}`;
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
              ${dict.date}: ${e.date} • ${dict.paid_by} ${e.payer} • ${dict.split} (${Object.keys(e.shares).length}): ${participants}
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
  const dict = translations[currentLang] || translations.en;

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
      el.querySelector('span:last-child').textContent = dict.empty_settle;
    });
    settlementLists.forEach(el => (el.style.display = 'none'));
    settlementBadges.forEach(b => (b.textContent = `0 ${dict.payments_unit}`));
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

  settlementBadges.forEach(b => (b.textContent = `${settlements.length} ${dict.payments_unit}`));

  if (settlements.length === 0) {
    settlementEmpties.forEach(el => {
      el.style.display = 'flex';
      el.querySelector('span:last-child').textContent = dict.all_square;
    });
    settlementLists.forEach(el => (el.style.display = 'none'));
  } else {
    const settlementHTML = settlements.map((s) => `
      <div class="settle-row">
        <span><b>${s.from}</b> ${dict.pays} <b>${s.to}</b></span>
        <div>
          <span class="settle-amount" style="margin-right: 8px;">${currencySymbol}${s.amount.toFixed(2)}</span>
          <button type="button" class="btn-lime" style="display:inline-block; padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="openPaymentGateway('${s.from}', '${s.to}', ${s.amount.toFixed(2)})">${dict.settle_now}</button>
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

// Payment Gateway Handlers
window.openPaymentGateway = function(from, to, amount) {
  const dict = translations[currentLang] || translations.en;
  activePayment = { from, to, amount };
  document.getElementById('payment-details-text').innerText = `${from} → ${to}: ${currencySymbol}${amount}`;
  document.getElementById('payment-modal').style.display = 'flex';
};

window.closePaymentModal = function() {
  document.getElementById('payment-modal').style.display = 'none';
  activePayment = null;
};

document.getElementById('confirm-pay-btn').addEventListener('click', async () => {
  const dict = translations[currentLang] || translations.en;
  if (!activePayment) return;
  alert(`${dict.payment_success} (${currencySymbol}${activePayment.amount})`);
  
  const settlementExpense = {
    desc: `Settlement: ${activePayment.from} → ${activePayment.to}`,
    amount: parseFloat(activePayment.amount),
    payer: activePayment.from,
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
    shares: { [activePayment.to]: parseFloat(activePayment.amount) }
  };

  const generatedId = await dbAdd('expenses', settlementExpense);
  settlementExpense.id = generatedId;
  expenses.push(settlementExpense);

  closePaymentModal();
  renderHistory();
  recalculate();
});
