
import { useEffect, useState } from "react";

const API = "https://libri-space-backend.onrender.com/api";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState("");

  async function loadBooks() {
    try {
      setError("");

      const response = await fetch(
        `${API}/books?search=${encodeURIComponent(search)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load books");
      }

      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [search]);

  async function issueBook(bookId) {
    try {
      setLoadingId(bookId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("libraryToken");

      if (!token) {
        throw new Error("Please log in to issue a book.");
      }

      const response = await fetch(`${API}/transactions/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not issue book");
      }

      setMessage("Book issued successfully! Check My Books.");
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId("");
    }
  }

  const coverColors = ["cover-0", "cover-1", "cover-2", "cover-3"];

  return (
    <main className="page">
      <section className="page-heading">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Explore our books</h1>
      </section>

      <section className="books-section">
        <input
          className="search"
          type="text"
          placeholder="Search title, author, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="book-grid">
          {books.map((book, index) => (
            <article className="book-card" key={book._id}>
              <div
                className={`book-cover designed-cover ${
                  coverColors[index % coverColors.length]
                }`}
              >
                <span className="cover-brand">LIBRISPACE</span>

                <span className="cover-sparkle">✦</span>

                <h2>{book.title}</h2>
              </div>

              <div className="book-info">
                <span className="category">{book.category}</span>

                <h3>{book.title}</h3>

                <p>by {book.author}</p>

                <div className="book-bottom">
                  <span>
                    {book.availableCopies} copies available
                  </span>

                  <span className="book-mark">↗</span>
                </div>

                <button
                  type="button"
                  onClick={() => issueBook(book._id)}
                  disabled={
                    book.availableCopies < 1 ||
                    loadingId === book._id
                  }
                >
                  {loadingId === book._id
                    ? "Issuing..."
                    : book.availableCopies < 1
                    ? "Unavailable"
                    : "Issue Book"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {!error && books.length === 0 && (
          <p className="empty">No books found.</p>
        )}
      </section>
    </main>
  );
}
