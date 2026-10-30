
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://libri-space-backend.onrender.com/api";

// MAIN APP
function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("libraryToken") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("libraryUser")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const response = await fetch(`${API}/books`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load books");
      }

      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch {
      setMessage("Cannot connect to the backend. Make sure the server is running.");
    }
  }

  async function login(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("Login token was not received.");
      }

      setToken(data.token);
      setUser(data.user || null);

      localStorage.setItem("libraryToken", data.token);
      localStorage.setItem(
        "libraryUser",
        JSON.stringify(data.user || null)
      );

      setEmail("");
      setPassword("");
      setMessage("Login successful! Welcome to LibriSpace.");
      setPage("home");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryUser");

    setToken("");
    setUser(null);
    setPage("home");
    setMessage("You have logged out.");
  }

  const filteredBooks = books.filter((book) => {
    const text = `${book.title || ""} ${book.author || ""} ${
      book.category || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo" onClick={() => setPage("home")}>
          <span className="logo-icon">L</span>
          <span>LibriSpace</span>
        </div>

        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("books")}>Books</button>

          {token ? (
            <>
              <button onClick={() => setPage("mybooks")}>
                My Books
              </button>

              {user?.role === "admin" && (
                <button onClick={() => setPage("admin")}>
                  Admin
                </button>
              )}

              <button className="login-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPage("login")}>
                Login
              </button>

              <button
                className="login-btn"
                onClick={() => setPage("register")}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {message && (
          <div className="message" role="status">
            {message}
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {(page === "home" || page === "books") && (
          <>
            <section className="hero">
              <p className="eyebrow">
                YOUR NEXT CHAPTER STARTS HERE
              </p>

              <h1>
                Discover a world
                <br />
                <span>between the pages.</span>
              </h1>

              <p className="hero-text">
                Explore our library, discover new stories, and keep
                all your reading in one place.
              </p>

              <button
                className="primary-btn"
                onClick={() => setPage("books")}
              >
                Explore Books →
              </button>

              <div className="hero-stats">
                <div>
                  <strong>{books.length}</strong>
                  <span>Books available</span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>Explore anytime</span>
                </div>

                <div>
                  <strong>One</strong>
                  <span>Reading community</span>
                </div>
              </div>
            </section>

            <section className="books-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">THE COLLECTION</p>
                  <h2>
                    {page === "home" ? "Explore our books" : "All books"}
                  </h2>
                </div>

                <input
                  className="search"
                  type="text"
                  placeholder="Search title, author, category..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {filteredBooks.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📚</div>
                  <h3>No books found</h3>
                  <p>Try another search.</p>
                </div>
              ) : (
                <div className="book-grid">
                  {filteredBooks.map((book) => (
                    <article className="book-card" key={book._id}>
                      <div className="book-cover">
                        <span>LIBRISPACE</span>
                        <div className="cover-symbol">✦</div>
                        <strong>{book.title}</strong>
                      </div>

                      <div className="book-info">
                        <span className="category">
                          {book.category || "General"}
                        </span>

                        <h3>{book.title}</h3>
                        <p>by {book.author || "Unknown author"}</p>

                        <div className="book-bottom">
                          <span>
                            {book.availableCopies ?? 0} copies available
                          </span>
                          <span className="book-mark">↗</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {page === "login" && (
          <section className="form-section">
            <div className="form-card">
              <p className="eyebrow">WELCOME BACK</p>
              <h2>Login to LibriSpace</h2>
              <p>Sign in to access your library account.</p>

              <form onSubmit={login}>
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                />

                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />

                <button className="primary-btn full-btn" type="submit">
                  Login
                </button>
              </form>

              <p className="form-note">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setPage("register");
                  }}
                >
                  Register
                </button>
              </p>
            </div>
          </section>
        )}

        {page === "register" && (
          <Register
            onSuccess={() => setPage("login")}
            setMessage={setMessage}
          />
        )}

        {page === "mybooks" && token && (
          <MyBooks token={token} />
        )}

        {page === "admin" && user?.role === "admin" && (
          <Admin
            token={token}
            books={books}
            refreshBooks={fetchBooks}
            setMessage={setMessage}
          />
        )}
      </main>

      <footer>
        <div className="logo">
          <span className="logo-icon">L</span>
          <span>LibriSpace</span>
        </div>

        <p>Every book opens a new world.</p>
        <span>© 2026 LibriSpace Library Management</span>
      </footer>
    </div>
  );
}

// REGISTER COMPONENT
function Register({ onSuccess, setMessage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setName("");
      setEmail("");
      setPassword("");
      setMessage("Registration successful! Please log in.");
      onSuccess();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="form-section">
      <div className="form-card">
        <p className="eyebrow">JOIN OUR COMMUNITY</p>
        <h2>Create an account</h2>
        <p>Register to become part of LibriSpace.</p>

        <form onSubmit={register}>
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />

          <button className="primary-btn full-btn" type="submit">
            Create Account
          </button>
        </form>

        <p className="form-note">
          Already have an account?{" "}
          <button type="button" onClick={onSuccess}>
            Login
          </button>
        </p>
      </div>
    </section>
  );
}

// MEMBER BORROWING HISTORY
function MyBooks({ token }) {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("Loading your books...");

  useEffect(() => {
    async function fetchMyBooks() {
      try {
        const response = await fetch(`${API}/transactions/my`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load your books");
        }

        setTransactions(Array.isArray(data) ? data : []);
        setMessage("");
      } catch (error) {
        setMessage(error.message);
      }
    }

    if (token) {
      fetchMyBooks();
    }
  }, [token]);

  return (
    <section className="books-section">
      <p className="eyebrow">YOUR READING</p>
      <h2>My Books</h2>
      <p>View your borrowing history and return deadlines.</p>

      {message && <p>{message}</p>}

      {!message && transactions.length === 0 && (
        <p>You haven't borrowed any books yet.</p>
      )}

      {transactions.length > 0 && (
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
                  <td>
                    {item.issueDate
                      ? new Date(item.issueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{item.status}</td>
                  <td>₹{item.fine || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ADMIN DASHBOARD
function Admin({ token, books, refreshBooks, setMessage }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [copies, setCopies] = useState(1);

  const [memberId, setMemberId] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [transactionMessage, setTransactionMessage] = useState("");

  // MEMBER MANAGEMENT STATE
  const [members, setMembers] = useState([]);
  const [memberMessage, setMemberMessage] = useState("");

  // DASHBOARD STATISTICS
  const totalBooks = books.length;
  const issuedBooks = transactions.filter(
    (item) => item.status === "issued"
  ).length;

  const returnedBooks = transactions.filter(
    (item) => item.status === "returned"
  ).length;

  const totalFines = transactions.reduce(
    (sum, item) => sum + (Number(item.fine) || 0),
    0
  );

  const totalMembers = members.length;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // LOAD TRANSACTIONS
  async function loadTransactions() {
    try {
      const response = await fetch(`${API}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load transactions");
      }

      setTransactions(Array.isArray(data) ? data : []);
      setTransactionMessage("");
    } catch (error) {
      setTransactionMessage(error.message);
    }
  }

  // LOAD ALL REGISTERED MEMBERS
  async function loadMembers() {
    try {
      const response = await fetch(`${API}/auth/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load members");
      }

      setMembers(Array.isArray(data) ? data : []);
      setMemberMessage("");
    } catch (error) {
      setMemberMessage(error.message);
    }
  }

  useEffect(() => {
    loadTransactions();
    loadMembers();
  }, [token]);

  // ADD BOOK
  async function addBook(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${API}/books`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          author,
          category,
          totalCopies: Number(copies),
          availableCopies: Number(copies)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add book");
      }

      setMessage("Book added successfully!");

      setTitle("");
      setAuthor("");
      setCategory("");
      setCopies(1);

      await refreshBooks();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // DELETE BOOK
  async function deleteBook(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete book");
      }

      setMessage("Book deleted successfully!");
      await refreshBooks();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // ISSUE BOOK
  async function issueBook(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${API}/transactions/issue`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: memberId.trim(),
          bookId: selectedBook
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not issue book");
      }

      setMessage("Book issued successfully!");

      setMemberId("");
      setSelectedBook("");

      await refreshBooks();
      await loadTransactions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // RETURN BOOK
  async function returnBook(id) {
    if (!window.confirm("Confirm that this book is being returned?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/transactions/${id}/return`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not return book");
      }

      setMessage(
        `Book returned successfully! Fine: ₹${data.fine}`
      );

      await refreshBooks();
      await loadTransactions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="books-section admin-section">
      <p className="eyebrow">LIBRARY CONTROL</p>

      <h2>Admin Dashboard</h2>
      <p>Manage books and borrowing records.</p>

      {/* DASHBOARD STATISTICS */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Books</h3>
          <p>{totalBooks}</p>
        </div>

        <div className="stat-card">
          <h3>Total Members</h3>
          <p>{totalMembers}</p>
        </div>

        <div className="stat-card">
          <h3>Issued Books</h3>
          <p>{issuedBooks}</p>
        </div>

        <div className="stat-card">
          <h3>Returned Books</h3>
          <p>{returnedBooks}</p>
        </div>

        <div className="stat-card">
          <h3>Total Fines</h3>
          <p>₹{totalFines}</p>
        </div>
      </div>

      {/* ADD NEW BOOK */}
      <h3>Add New Book</h3>

      <form className="admin-form" onSubmit={addBook}>
        <label htmlFor="book-title">Book title</label>
        <input
          id="book-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book title"
        />

        <label htmlFor="book-author">Author</label>
        <input
          id="book-author"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author name"
        />

        <label htmlFor="book-category">Category</label>
        <input
          id="book-category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />

        <label htmlFor="book-copies">Total copies</label>
        <input
          id="book-copies"
          type="number"
          min="1"
          required
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
        />

        <button className="primary-btn" type="submit">
          + Add Book
        </button>
      </form>

      {/* MANAGE BOOKS */}
      <h3 className="manage-heading">Manage Books</h3>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Available</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.availableCopies ?? 0}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteBook(book._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ISSUE A BOOK */}
      <h3 className="manage-heading">Issue a Book</h3>
      <p>Enter the member's MongoDB User ID and select a book.</p>

      <form className="admin-form" onSubmit={issueBook}>
        <label htmlFor="member-id">Member User ID</label>

        <input
          id="member-id"
          required
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="Enter member's User ID"
        />

        <label htmlFor="selected-book">Select Book</label>

        <select
          id="selected-book"
          required
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">Choose a book</option>

          {books
            .filter((book) => book.availableCopies > 0)
            .map((book) => (
              <option key={book._id} value={book._id}>
                {book.title} ({book.availableCopies} available)
              </option>
            ))}
        </select>

        <button className="primary-btn" type="submit">
          Issue Book
        </button>
      </form>

      {/* MEMBER MANAGEMENT */}
      <h3 className="manage-heading">Member Management</h3>

      <p>View all registered library users and their account roles.</p>

      <button
        type="button"
        className="primary-btn"
        onClick={loadMembers}
      >
        Refresh Members
      </button>

      {memberMessage && <p>{memberMessage}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member._id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className="category">
                      {member.role}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  {memberMessage
                    ? "Unable to load members."
                    : "No registered members found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BORROWING TRANSACTIONS */}
      <h3 className="manage-heading">Borrowing Transactions</h3>

      {transactionMessage && <p>{transactionMessage}</p>}

      <button
        type="button"
        className="primary-btn"
        onClick={loadTransactions}
      >
        Refresh Transactions
      </button>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Book</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.name || "Unknown"}</td>
                <td>{item.book?.title || "Unknown"}</td>

                <td>
                  {item.dueDate
                    ? new Date(item.dueDate).toLocaleDateString()
                    : "-"}
                </td>

                <td>{item.status}</td>
                <td>₹{item.fine || 0}</td>

                <td>
                  {item.status === "issued" ? (
                    <button
                      className="primary-btn"
                      onClick={() => returnBook(item._id)}
                    >
                      Return
                    </button>
                  ) : (
                    "Returned"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default App;
