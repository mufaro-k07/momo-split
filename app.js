// This is main application which contains the api configuration

// Base Url for the mock Momo API( this is using the local proxy)
const BASE_URL = "https://69241e1d3ad095fb8472c4a0.mockapi.io";

// Endpoints being used
const TRANSACTIONS_ENDPOINT = `${BASE_URL}/transactions`;
// const SUMMARY_ENDPOINT = `${BASE_URL}/transactions/summary`;

 const BACKUP_API = "https://raw.githubusercontent.com/mufaro-k07/momo-split/refs/heads/main/transactions.json"

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

// Getting the elements from the HTML DOM

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
    if (!messageBar) return;

    messageBar.textContent = message;
    messageBar.className = "message-bar";
    if (type === "error") {
        messageBar.classList.add("message-error");
    } else if (type === "success") {
        messageBar.classList.add("message-success");
    } else {
        messageBar.classList.add("message-info")
    }
}

function clearMessage() {
    messageBar.textContent = "";
    messageBar.className = "message-bar hidden";
}

// Fetching Transactions from external API
// We are fetching paginated transactions from the external MOMO API, and using page 0.
// Essentially this functions fetches the GitHub raw JSON which was created as the backup.

async function fetchTransactionsFromAPI() {
    try {
        showMessage("Loading transactions from server....", "info");

        // Using the primary mockapi endpoint
        const response = await fetch(TRANSACTIONS_ENDPOINT);

        if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
        console.log("API raw response", data);

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error(`No transactions found for ${response.status}, 'transactions' array is missing/empty`);
        }

        allTransactions = data.map((item) => {
            const rawType = (item.type || "").toLowerCase();
            const direction = rawType === "credit" ? "credit" : "debit";

            return {
                id: item.id,
                date: item.date,
                from: item.from,
                to: item.to,
                name: item.name || "",
                description: item.description || "",
                direction,
                amount: Number(item.amount) || 0
            };
        });

        classifyTransactions();
        showMessage("Transactions successfully loaded.", "info");
    } catch (err) {
        console.error("Failed to load transactions from API:", err);
        showMessage("Could not load transactions from server..., Showing the local fallback data instead.",
            "error");

        // Trying the fallback data which is the GitHub JSON
        try {
            const backupResp = await fetch(BACKUP_API);

            if (!backupResp.ok) {
                throw new Error(`Backup API HTTP status ${backupResp.status}`);
            }

            const backupData = await backupResp.json();
            console.log("Backup API raw response", backupData);

            if (!backupData.transactions || !Array.isArray(backupData.transactions) || backupData.transactions.length === 0) {
                throw new Error("Backup API returned no transactions");
            }

            allTransactions = backupData.transactions.map((item) => {
                const rawType = (item.type || "").toLowerCase();
                const direction = rawType === "credit" ? "credit" : "debit";

                return {
                    id: item.id,
                    date: item.date,
                    from: String(item.from || ""),
                    to: String(item.to || ""),
                    name: item.name || "",
                    description: item.description || "",
                    direction,
                    amount: Number(item.amount) || 0
                };
            });

            classifyTransactions();
            showMessage("Transactions loaded from backup data source.", "success");
        } catch (backupErr) {
            console.error("Failed to load transactions from backup API:", backupErr);

            // the last fallback
            showMessage(
                "Could not load from server or backup. Showing local fallback data.",
                "error"
            );

            allTransactions = allTransactions.map((tx) => ({
                ...tx,
                from: String(tx.from || ""),
                to: String(tx.to || ""),
                direction: (tx.direction || "").toLowerCase() === "credit" ? "credit" : "debit",
                amount: Number(tx.amount) || 0
            }));

            classifyTransactions();
        }
    }
}

// Fetching the summary statistics from the API
// async function fetchSummary () {
//     try {
//         const response = await fetch(SUMMARY_ENDPOINT);
//         if (!response.ok) {
//             throw new Error(`Summary HTTP status ${response.status}`);
//         }
//         const summary = await response.json();
//         console.log("API Summary:", summary);
//     } catch (e) {
//         console.error("Could not fetch summary from API:", e);
//     }
// }

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
    const typeFilter = typeFilterEl.value; // this filter will allow to show all, business, personal, other
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

    // Allowing search across from, to, name, description
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
        td.colSpan = 8;
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

        const cashTd = document.createElement("td");
        cashTd.textContent = tx.direction === "credit" ? "Money IN" : "Money OUT";
        tr.appendChild(cashTd);

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
    showMessage("Settings applied. Transactions reclassified.", "success");
});

typeFilterEl.addEventListener("change", renderFilteredTransactions);
directionFilterEl.addEventListener("change", renderFilteredTransactions);
searchInputEl.addEventListener("input", renderFilteredTransactions);
sortSelectEl.addEventListener("change", renderFilteredTransactions);

// Initialisation

async function init() {
    clearMessage();
    await fetchTransactionsFromAPI();
    // await fetchSummary(); // this is for debugging
}

init();