document.addEventListener("DOMContentLoaded", function () {
    const btnAddEntry = document.querySelector("#add-entry");
    const categoryInput = document.querySelector("#category");
    const dateInput = document.querySelector("#date");
    const amountInput = document.querySelector("#amount");
    const descriptionInput = document.querySelector("#description");
    const message = document.querySelector("#message");
    const btnViewEntry = document.querySelector("#view-entry");
    const fromInput = document.querySelector("#from-date");
    const toInput = document.querySelector("#to-date");
    const entriesBody = document.querySelector("#entries-body");
    

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "alert alert-" + type;
    }

    function renderEntries(rows){
        entriesBody.innerHTML = "";
        rows.forEach(function(row){
            const tr = document.createElement("tr");
            const values = [
                row.EntryDate,
                row.Category == "I" ? "Income": "Expense",
                Number(row.Amount).toFixed(2),
                row.Description || ""
            ];
            values.forEach(function(value){
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });
            entriesBody.appendChild(tr);
        });
    }
    if (btnAddEntry) {
        btnAddEntry.addEventListener("click", async function () {
            const category = categoryInput.value.trim().toUpperCase();
            const date = dateInput.value;
            const amount = parseFloat(amountInput.value);
            const description = descriptionInput.value.trim();

            if (category !== "E" && category !== "I") {
                showMessage("Category must be E (Expense) or I (Income).", "danger");
                return;
            }
            if (!date) {
                showMessage("Please choose a date.", "danger");
                return;
            }
            if (Number.isNaN(amount) || amount <= 0) {
                showMessage("Amount must be a number greater than 0.", "danger");
                return;
            }

            const entry = { category, date, amount, description };

            try {
                const response = await fetch("/api/entries", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entry)
                });
                const data = await response.json();

                if (!response.ok) {
                    showMessage(data.error || "Could not save the entry.", "danger");
                    return;
                }

                showMessage("Entry saved.", "success");
                categoryInput.value = "";
                dateInput.value = "";
                amountInput.value = "";
                descriptionInput.value = "";
            } catch (err) {
                showMessage("Could not reach the server.", "danger");
            }
        });
    }
    if(btnViewEntry){
        btnViewEntry.addEventListener("click", async function() {
            const from = fromInput.value;
            const to = toInput.value;
            if (from && to && from > to){
                showMessage("The Form date must be on or before the To Date.", "danger");
                return;

            }
            const params = new URLSearchParams();
            if(from) params.append("from", from);
            if(to) params.append("to", to);
            try{
                const response = await fetch("/api/entries?" + params.toString());
                const data = await response.json();
                if(!response.ok){
                    showMessage(data.error || "Could not load entries.", "danger");
                    return;
                }
                renderEntries(data);
                showMessage(data.length + "Entries found.", "success");

            } catch(err){
                showMessage("Could not reach the server", "danger")
            }
        });
    }
});