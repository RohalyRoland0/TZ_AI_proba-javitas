const express = require("express");
const mysql = require("mysql2");

const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "szerviz_db"
});

db.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Adatbázis kapcsolat létrejött");
});

app.get("/szolgaltatasok", (req, res) => {
    const sql = `
        SELECT s.id,
               s.megnevezes,
               s.alapar,
               s.munkaido_perc,
               s.aktiv,
               k.nev AS kategoria_nev
        FROM szolgaltatasok s
        JOIN kategoriak k
        ON s.kategoria_id = k.id
        ORDER BY s.alapar ASC
    `;

    db.query(sql, (err, result) => {
        if (err)
            return res.status(500).json({ hiba: err.message });

        res.json(result);
    });
});

app.get("/szolgaltatasok/elerheto", (req, res) => {
    const sql = `
        SELECT *
        FROM szolgaltatasok
        WHERE aktiv = 1
        AND munkaido_perc <= 60
    `;

    db.query(sql, (err, result) => {
        if (err)
            return res.status(500).json({ hiba: err.message });

        res.json(result);
    });
});

app.get("/szolgaltatasok/kereses/:szoveg", (req, res) => {
    const sql = `
        SELECT *
        FROM szolgaltatasok
        WHERE megnevezes LIKE ?
    `;

    db.query(sql, [`%${req.params.szoveg}%`], (err, result) => {
        if (err)
            return res.status(500).json({ hiba: err.message });

        res.json(result);
    });
});

app.get("/kategoriak/statisztika", (req, res) => {
    const sql = `
        SELECT
            k.nev AS kategoria_nev,
            COUNT(s.id) AS szolgaltatasok_szama,
            ROUND(AVG(s.alapar),1) AS atlagos_alapar
        FROM kategoriak k
        JOIN szolgaltatasok s
        ON k.id = s.kategoria_id
        GROUP BY k.id, k.nev
    `;

    db.query(sql, (err, result) => {
        if (err)
            return res.status(500).json({ hiba: err.message });

        res.json(result);
    });
});

app.get("/szolgaltatasok/dragak", (req, res) => {
    const sql = `
        SELECT megnevezes,
               alapar,
               munkaido_perc
        FROM szolgaltatasok
        WHERE alapar > 25000
        ORDER BY munkaido_perc DESC
    `;

    db.query(sql, (err, result) => {
        if (err)
            return res.status(500).json({ hiba: err.message });

        res.json(result);
    });
});

app.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});