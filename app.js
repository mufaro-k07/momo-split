// This is main application which contains the api configuration

// fetching the raw http file which is essentially the api
const API_URL = "https://raw.githubusercontent.com/mufaro-k07/momo-split/refs/heads/main/transactions.json"

// Creating a fallback given the API fails

let allTransactions = [
    {
        id: "local-tx1",
        date: "2025-02-20T10:15:00Z",
        from: "0788000111",
        to: "123456",
        description: "Customer payment - Kota + Spiral Potato",
        direction: "credit",
        amount: 5500
    },
    {
        id: "local-tx2",
        date: "2025-02-19T19:10:00Z",
        from: "0788123456",
        to: "0788000001",
        description: "Personal Momo from friend",
        direction: "credit",
        amount: 15000
    }
];

// creating an array for the different categories
let classifiedTransactions = [];

// Getting the elements from the HTML

const personalNumInput = document.getElementById("personalNum");
const merchantCodeInput = document.getElementById("merchantCode");
const applySettingsBtn = document.getElementById("applySettingsBtn");

const businessInflowEl = document.getElementById("businessInflow");
const personalInflowEl = document.getElementById("personalInflow");
const businessCountEl = document.getElementById("businessCount");

const typeFilterEl = document.getElementById("typeFilter");
const directionFilterEl = document.getElementById("directionFilter");
const searchInputEl = document.getElementById("searchInput");
const sortSelectEl = document.getElementById("sortSelect");

const messageBar = document.getElementById("messageBar");
const transactionsBody = document.getElementById("transactionsBody");

let settings = {
    personalNum: "",
    merchantCode: "",
};

// function to help in showing or hiding messages
function showMessage(message, type = "info") {
    messageBar.textContent = message;
    messageBar.className = "message-bar " + type;
}

function clearMessage() {
    messageBar.textContent = "";
    messageBar.className = "message-bar hidden";
}

// Fetching Transactions from external API
// Essentially this functions fetches the GitHub raw JSON which was created

async function fetchTransactionsFromAPI() {
    try {
        showMessage("Loading transactions from server....", "info");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();

        if (!data.transactions || !Array.isArray(data.transactions)) {
            throw new Error(`No transactions found for ${response.status}, 'transactions' array is missing`);
        }

        allTransactions = data.transactions.map((item) => ({
            id: item.id,
            date: item.date,
            from: item.from,
            to: item.to,
            name: item.name || "",
            description: item.description || "",
            direction: (item.type || "").toLowerCase() === "credit" ? "credit" : "debit", // I use type and direction here because the JSON has 'type'
            amount: Number(item.amount) || "0",
        }));

        classifyTransactions();
        showMessage("Transactions successfully loaded.", "info");
    } catch (err) {
        console.error("Failed to load transactions from API:", err);
        showMessage("Could not load transactions from server..., Showing the local fallback data instead.",
            "error");

        classifyTransactions();
    }
}

// Making the classification function
/**
 * This function classifies transactions as 'personal', 'business', or 'other'
 * It makes use of settings.personalNum and settings, merchant code to assign which category a transaction belongs to
 */

function classifyTransactions() {
    const { personalNum, merchantCode } = settings;

    classifiedTransactions = allTransactions.map((tx) => {
        let category = "other";

        // The Business inflow: this is to the merchant code and also incoming transactions
        if (merchantCode && tx.to === merchantCode && tx.direction === "credit") {
            category = "business";
        }
        // Personal inflow: this is to the personal number and incoming
        else if (
            personalNum &&
            tx.to === personalNum &&
            tx.direction === "credit"
        ) {
            category = "personal";
        }

        return { ...tx, category};
    });

    updateSummary();
    renderFilteredTransactions();
}

function updateSummary() {
    let businessInflow = 0;
    let personalInflow = 0;
    let businessCount = 0;

    classifiedTransactions.forEach((tx) => {
        if (tx.category === "business" && tx.direction === "credit") {
            businessInflow += tx.amount;
            businessCount += 1;
        } else if (tx.category === "personal" && tx.direction === "credit") {
            personalInflow += tx.amount;
        }
    });
    businessInflowEl.textContent = `RWF ${businessInflow.toLocaleString()}`;
    personalInflowEl.textContent = `RWF ${personalInflow.toLocaleString()}`;
    businessCountEl.textContent = businessCount.toString();
}

// The User Interactivity Part
/**
 * This sections the part which will allow users to interact more smoothly with the information
 * It includes stuff such as filtering, sorting and searching
 */

function getFilteredAndSortedTransactions() {
    const typeFilter = typeFilterEl.value; // all, business, personal, other
    const directionFilter = directionFilterEl.value; // all, credit, debit
    const searchTerm = searchInputEl.value.trim().toLowerCase();
    const sortBy = sortSelectEl.value;

    let result = [...classifiedTransactions];

    // Filtering by category
    if (typeFilter !== "all") {
        result = result.filter((tx) => tx.category === typeFilter);
    }

    // Filtering by direction (which is by credit or by debit
    if (directionFilter !== "all") {
        result = result.filter((tx) => tx.direction === directionFilter);
    }

    // Allowing search across from, to ,description
    if (searchTerm) {
        result = result.filter((tx) => {
            const combined = `${tx.from} ${tx.to} ${tx.name} ${tx.description}`.toLowerCase();
            return combined.includes(searchTerm);
        });
    }

    // Sorting the transactions
    result.sort((a, b) => {
        if (sortBy === "date_desc") {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === "date_asc") {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === "amount_desc") {
            return b.amount - a.amount;
        } else if (sortBy === "amount_asc") {
            return a.amount - b.amount;
        }
        return 0;
    })

    return result;
}

function renderFilteredTransactions() {
    const rows = getFilteredAndSortedTransactions();

    transactionsBody.innerHTML = "";

    if (rows.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 7;
        td.textContent = "No transactions found for the selected filters.";
        tr.appendChild(td);
        transactionsBody.appendChild(tr);
        return;
    }

    rows.forEach((tx) => {
        const tr = document.createElement("tr");

        const dateTd = document.createElement("td");
        dateTd.textContent = new Date(tx.date).toLocaleDateString();
        tr.appendChild(dateTd);

        const fromTd = document.createElement("td");
        fromTd.textContent = tx.from;
        tr.appendChild(fromTd);

        const toTd = document.createElement("td");
        toTd.textContent =tx.to;
        tr.appendChild(toTd);

        const nameTd = document.createElement("td");
        nameTd.textContent = tx.name || "";
        tr.appendChild(nameTd);

        const descTd = document.createElement("td");
        descTd.textContent = tx.description;
        tr.appendChild(descTd);

        const dirTd = document.createElement("td");
        dirTd.textContent = tx.direction === "credit" ? "Money IN" : "Money OUT";
        tr.appendChild(dirTd);

        const amountTd = document.createElement("td");
        amountTd.textContent = tx.amount.toLocaleString();
        tr.appendChild(amountTd);

        const categoryTd = document.createElement("td");
        const span = document.createElement("span");
        span.classList.add("category-pill");
        if (tx.category === "business") {
            span.classList.add("category-business");
            span.textContent = "Business";
        } else if (tx.category === "personal") {
            span.classList.add("category-personal");
            span.textContent = "Personal";
        } else {
            span.classList.add("category-other");
            span.textContent = "Other";
        }
        categoryTd.appendChild(span);
        tr.appendChild(categoryTd);

        transactionsBody.appendChild(tr);
    });
}

// Event Listeners

applySettingsBtn.addEventListener("click", () => {
    const personal = personalNumInput.value.trim();
    const merchant = merchantCodeInput.value.trim();

    if (!personal && !merchant) {
        showMessage(
            "Please enter at least a personal number or a merchant code.",
            "error"
        );
        return;
    }

    settings.personalNum = personal;
    settings.merchantCode = merchant;

    classifyTransactions();
    clearMessage();
    showMessage("Settings applied. Transactions reclassified.", "info");
});

typeFilterEl.addEventListener("change", renderFilteredTransactions);
directionFilterEl.addEventListener("change", renderFilteredTransactions);
searchInputEl.addEventListener("input", () => {
    renderFilteredTransactions();
});
sortSelectEl.addEventListener("change", renderFilteredTransactions);


// init

async function init() {
    clearMessage();
    await fetchTransactionsFromAPI();
}

init();