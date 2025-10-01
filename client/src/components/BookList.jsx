import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/booklist.css";

const BookList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const base = import.meta.env.VITE_BASE_URL || "/";

  useEffect(() => {
    fetch(base + "api/books", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Erreur:", error));
    fetch(base + "api/session", {
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        else throw new Error("Account not found");
      })
      .then((data) => setUserRole(data.user.role || "Guest"))
      .catch((error) => setUserRole("Guest"));
    fetch(base + "api/borrow", { credentials: "include" })
      .then((response) => {
        if (response.status === 200) return response.json();
        else throw new Error("Borrowed books not founds");
      })
      .then((data) => setBorrowedBooks(data))
      .catch((error) => console.error("Erreur:", error));
  }, []);

  const handleAddBook = () => {
    navigate("/add_book");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handelBorrow = async (bookId) => {
    if (returnDate === "") {
      alert("Vous devez spécifier une date de retour pour emprunter un livre");
      return;
    }
    const fullReturnDate = new Date(returnDate);
    const returnDateLimit = new Date();
    returnDateLimit.setDate(returnDateLimit.getDate() + 30);
    if (fullReturnDate > returnDateLimit) {
      alert("Vous ne pouvez emprunter que pour une durée de 30 jours maximum");
      return;
    }
    try {
      const response = await fetch(base + "api/borrow/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: bookId,
          returnDate: returnDate,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 200) {
        window.location.reload();
      } else {
        setError(
          data.message || "Une erreur est survenue. Veuillez réessayer."
        );
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const isBorrowedByCurrentUser = (bookId) => {
    return borrowedBooks.find((borrow) => borrow.livres_id == bookId);
  };

  const handleReturn = async (bookId) => {
    try {
      const response = await fetch(base + "api/borrow/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: bookId,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 200) {
        window.location.reload();
      } else {
        setError(
          data.message || "Une erreur est survenue. Veuillez réessayer."
        );
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="container">
      <h2>Liste des Livres - Librairie XYZ</h2>
      {books.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Date de publication</th>
              <th>Statut</th>
              <th>Détails</th>
              <th>Emprunter</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <img
                    className="book-image"
                    src={book.photo_url}
                    alt={book.titre}
                  />
                </td>
                <td>{book.titre}</td>
                <td>{book.auteur}</td>
                <td>{book.date_publication}</td>
                <td>{book.statut}</td>
                <td>
                  <a href={`${base}book/${book.id}`}>Voir les détails</a>
                </td>
                <td>
                  {book.statut == "emprunté" ? (
                    isBorrowedByCurrentUser(book.id) ? (
                      <button onClick={() => handleReturn(book.id)}>
                        Retourner
                      </button>
                    ) : (
                      <p>Indisponible</p>
                    )
                  ) : (
                    <div>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                      <button onClick={() => handelBorrow(book.id)}>
                        Emprunter
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Erreur lors de la récupération des livres.</p>
      )}
      {userRole === "admin" && (
        <button onClick={handleAddBook}>Ajouter un livre</button>
      )}
      <button onClick={handleHome}>Retour à l'accueil</button>
    </div>
  );
};

export default BookList;
