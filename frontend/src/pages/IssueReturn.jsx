
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "https://libri-space-backend.onrender.com/api";

export default function IssueReturn() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  async function loadData() {
    const [bookResponse, transactionResponse] = await Promise.all([
      fetch(`${API}/books`),
      fetch(`${API}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    const bookData = await bookResponse.json();
    const transactionData = await transactionResponse.json();

    if (!bookResponse.ok) throw new Error(bookData.message || "Could not load books");
    if (!transactionResponse.ok) {
      throw new Error(transactionData.message || "Could not load transactions");
    }

    setBooks(bookData);
    setTransactions(transactionData);

    const memberIds = [
      ...new Set(
        transactionData
          .filter((item) => item.user?._id)
          .map((item) => item.user._id)
      )
    ];

    // The backend does not provide a member-list endpoint yet.
    setUsers(memberIds.map((id) => {
      const record = transactionData.find((item) => item.user?._id === id);
      return record.user;
    }));
  }

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, [token]);

  async function issueBook(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/transactions/issue`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, bookId })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not issue book");

      setMessage(data.message);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function returnBook(id) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/transactions/${id}/return`, {
        method: "POST",
        headers
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not return book");

      setMessage(`${data.message}. Fine: ₹${data.fine}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <h1>Issue & Return Books</h1>
      <p>Manage borrowing records.</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form-card" onSubmit={issueBook}>
        <h2>Issue a Book</h2>

        <label>Registered member</label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
          <option value="">Select a member</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} — {user.email}
            </option>
          ))}
        </select>

        <label>Book</label>
        <select value={bookId} onChange={(e) => setBookId(e.target.value)} required>
          <option value="">Select a book</option>
          {books.filter((book) => book.availableCopies > 0).map((book) => (
            <option key={book._id} value={book._id}>
              {book.title} ({book.availableCopies} available)
            </option>
          ))}
        </select>

        <button type="submit">Issue Book</button>
        <p className="muted">
          Members with no borrowing history are not listed here yet.
        </p>
      </form>

      <h2>All Transactions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Book</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.name || "Unknown"}</td>
                <td>{item.book?.title || "Unknown"}</td>
                <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === "issued" ? (
                    <button onClick={() => returnBook(item._id)}>Return</button>
                  ) : "Returned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
