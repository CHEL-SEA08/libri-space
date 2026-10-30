
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function MyBooks() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch(
          "https://libri-space-backend.onrender.com/api/transactions/my",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Could not load records");

        setTransactions(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadTransactions();
  }, [token]);

  return (
    <main className="page">
      <h1>My Borrowing History</h1>
      <p>View your issued and returned books.</p>

      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id}>
                <td>{item.book?.title || "Book unavailable"}</td>
                <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                <td>{item.status}</td>
                <td>₹{item.fine || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!error && transactions.length === 0 && <p>You have no borrowing records yet.</p>}
    </main>
  );
}
