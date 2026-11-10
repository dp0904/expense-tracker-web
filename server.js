require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true
});

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

app.post("/api/entries", async (req, res) => {
    const { category, date, amount, description } = req.body;

    const cat = String(category || "").trim().toUpperCase();
    const amt = Number(amount);
    const desc = description ? String(description).trim() : null;

    if (cat !== "E" && cat !== "I") {
        return res.status(400).json({ error: "Category must be E or I." });
    }
    if (!dateRegex.test(date || "")) {
        return res.status(400).json({ error: "Date must be a valid date." });
    }
    if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({ error: "Amount must be greater than zero." });
    }
    if (desc && desc.length > 250) {
        return res.status(400).json({ error: "Description is too long (250 max)." });
    }

    try {
        const [result] = await pool.execute(
            "INSERT INTO TblEntries (EntryDate, Amount, Category, Description) VALUES (?, ?, ?, ?)",
            [date, amt, cat, desc]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error." });
    }
});

app.get("/api/entries", async (req, res) => {
    const { from, to } = req.query;

    if ((from && !dateRegex.test(from)) || (to && !dateRegex.test(to))) {
        return res.status(400).json({ error: "Dates must be valid dates." });
    }
    if (from && to && from > to) {
        return res.status(400).json({ error: "From date must be on or before To date." });
    }

    let sql = "SELECT EntryID, EntryDate, Amount, Category, Description FROM TblEntries";
    const conditions = [];
    const params = [];

    if (from) {
        conditions.push("EntryDate >= ?");
        params.push(from);
    }
    if (to) {
        conditions.push("EntryDate <= ?");
        params.push(to);
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY EntryDate DESC, EntryID DESC";

    try {
        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error." });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));