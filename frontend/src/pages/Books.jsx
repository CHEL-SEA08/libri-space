
import { useEffect, useState } from "react";

const API = "https://libri-space-backend.onrender.com/api";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooks() {
      try {
        const response = await fetch(
          `${API}/books?search=${encodeURIComponent(search)}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Could not load books");

        setBooks(data);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }

    loadBooks();
  }, [search]);

  return (
    <main className="page">
      <section className="page-heading">
        <p className="eyebrow">YOUR DIGITAL LIBRARY</p>
        <h1>Discover your next great read.</h1>
        <p>Explore books and find something new to learn.</p>
      </section>

      <section className="books-section">
        <h2>Our Book Collection</h2>

        <input
          className="search"
          placeholder="Search title, author, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <div className="book-grid">
          {books.map((book) => (
            <article className="book-card" key={book._id}>
              <div className="book-cover">📖</div>
              <span className="category">{book.category}</span>
              <h3>{book.title}</h3>
              <p>By {book.author}</p>
              <p>
                Available copies: {book.availableCopies} / {book.totalCopies}
              </p>
            </article>
          ))}
        </div>

        {!error && books.length === 0 && <p>No books found.</p>}
      </section>
    </main>
  );
}
