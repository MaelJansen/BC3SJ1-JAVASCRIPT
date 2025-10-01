const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../services/database");

const JWT_SECRET = "HelloThereImObiWan";

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.post("/borrow", authenticateToken, (req, res) => {
  const { bookId, returnDate } = req.body;
  const borrowDate = new Date().toISOString().split("T")[0];
  const sql =
    "INSERT INTO emprunts (utilisateur_id, livres_id, date_emprunt, date_retour) VALUES (?, ?, ?, ?)";
  db.query(
    sql,
    [req.user.id, bookId, borrowDate, returnDate],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Problème SQL");
      }
    }
  );
  const sqlBook = 'UPDATE livres SET statut = "emprunté" WHERE id = ?';
  db.query(sqlBook, bookId, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Problème SQL");
    }
  });
  res.json("Emprunt effectué");
});

module.exports = router;
