
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "https://libri-space-backend.onrender.com/api";
const FINE_PER_DAY = 5;

export default function MemberDashboard() {
  const { user, token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(`${API}/transactions/my`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load dashboard");
        }

        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadDashboard();
    } else {
      setError("Please log in to view your dashboard.");
      setLoading(false);
    }
  }, [token]);

  const issuedBooks = transactions.filter(
    (item) => item.status === "issued"
  );

  const returnedBooks = transactions.filter(
    (item) => item.status === "returned"
  );

  const pendingFine = issuedBooks.reduce((total, item) => {
    const overdueDays = Math.max(
      0,
      Math.ceil(
        (Date.now() - new Date(item.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    return total + overdueDays * FINE_PER_DAY;
  }, 0);

  const stats = [
    {
      title: "Total Borrowed",
      value: transactions.length,
      icon: "📚"
    },
    {
      title: "Currently Issued",
      value: issuedBooks.length,
      icon: "📖"
    },
    {
      title: "Books Returned",
      value: returnedBooks.length,
      icon: "✓"
    },
    {
      title: "Pending Fine",
      value: `₹${pendingFine}`,
      icon: "₹"
    }
  ];

  if (loading) {
    return (
      <main className="page">
        <h2>Loading your dashboard...</h2>
      </main>
    );
  }

  return (
    <main className="page member-dashboard">
      <section className="member-welcome">
        <div>
          <p className="eyebrow">YOUR READING SPACE</p>
          <h1>Welcome, {user?.name || "Reader"}!</h1>
          <p>Keep track of your reading journey with LibriSpace.</p>
          <p className="member-email">{user?.email}</p>
        </div>

        <div className="welcome-icon">📚</div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="member-stats">
        {stats.map((stat) => (
          <article className="member-stat-card" key={stat.title}>
            <span className="member-stat-icon">{stat.icon}</span>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
          </article>
        ))}
      </section>

      <section className="member-actions">
        <div>
          <h2>Your Library</h2>
          <p>Discover books or check your borrowing history.</p>
        </div>

        <div className="member-buttons">
          <Link to="/books" className="member-button">
            Browse Books
          </Link>

          <Link to="/my-books" className="member-button secondary">
            My Books
          </Link>
        </div>
      </section>

      <section className="member-history">
        <h2>Recently Borrowed Books</h2>

        {transactions.length === 0 ? (
          <p>
            You haven't borrowed any books yet. Explore our collection!
          </p>
        ) : (
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
                {transactions.slice(0, 5).map((item) => (
                  <tr key={item._id}>
                    <td>{item.book?.title || "Book unavailable"}</td>
                    <td>
                      {new Date(item.issueDate).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`member-status ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>₹{item.fine || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/my-books" className="view-history">
          View Complete History →
        </Link>
      </section>

      <p className="fine-note">
        Pending fines are estimated at ₹5 per overdue day for currently
        issued books. Final returned-book fines are recorded by the
        library administrator.
      </p>
    </main>
  );
}
