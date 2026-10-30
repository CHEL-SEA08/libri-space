import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("General");
  const [isbn, setIsbn] = useState("");
  const [copies, setCopies] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBooks() {
    const response = await fetch(`${API}/books`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Could not load books");

    setBooks(data);
  }

  useEffect(() => {
    loadBooks().catch((err) => setError(err.message));
  }, []);

  async function addBook(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          author,
          category,
          isbn,
          totalCopies: Number(copies)
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not add book");

      setMessage("Book added successfully");
      setTitle("");
      setAuthor("");
      setCategory("General");
      setIsbn("");
      setCopies(1);
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteBook(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not delete book");

      setMessage(data.message);
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <h1>Admin Dashboard</h1>
      <p>Manage the library catalogue.</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form-card" onSubmit={addBook}>
        <h2>Add a New Book</h2>

        <label>Book Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Author</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} required />

        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />

        <label>ISBN (optional)</label>
        <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />

        <label>Total Copies</label>
        <input
          type="number"
          min="1"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          required
        />

        <button type="submit">Add Book</button>
      </form>

      <h2>Library Catalogue ({books.length} books)</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.availableCopies} / {book.totalCopies}</td>
                <td>
                  <button className="danger" onClick={() => deleteBook(book._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
