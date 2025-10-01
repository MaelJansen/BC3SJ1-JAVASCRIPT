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

router.get("/", authenticateToken, (req, res) => {
  const sql =
    'SELECT livres_id, date_emprunt, date_retour FROM emprunts JOIN livres ON emprunts.livres_id = livres.id WHERE utilisateur_id = ? AND statut = "emprunté"';
  console.log(req.user.id);
  db.query(sql, req.user.id, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Problème SQL");
    }
    res.json(result);
  });
});

router.post("/return", authenticateToken, (req, res) => {
  const { bookId } = req.body;
  const sql = "DELETE FROM emprunts WHERE livres_id = ?";
  db.query(sql, bookId, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Problème SQL");
    }
  });
  const sqlBook = 'UPDATE livres SET statut = "disponible" WHERE id = ?';
  db.query(sqlBook, bookId, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Problème SQL");
    }
  });
  res.json("Retour effectué");
});
module.exports = router;
