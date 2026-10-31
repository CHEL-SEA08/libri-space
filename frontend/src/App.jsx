
import "./App.css";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import MyBooks from "./pages/MyBooks";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import IssueReturn from "./pages/IssueReturn";

function ProtectedRoute({
  children,
  adminOnly = false,
  memberOnly = false
}) {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (memberOnly && user.role !== "member") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>

        <h1>
          Discover a world
          <br />
          between the pages.
        </h1>

        <p>
          Explore our library, discover new stories, and
          keep all your reading in one place.
        </p>

        <Link to="/books" className="primary-btn">
          Explore Books →
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  const { user, token, logout } = useAuth();

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="logo">
          <span className="logo-icon">L</span>
          <span>LibriSpace</span>
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>

          {token && user?.role === "member" && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-books">My Books</Link>
            </>
          )}

          {token && user?.role === "admin" && (
            <>
              <Link to="/admin">Admin Dashboard</Link>
              <Link to="/issue-return">Issue & Return</Link>
            </>
          )}

          {token ? (
            <button className="login-btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="login-btn">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/books" element={<Books />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute memberOnly>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-books"
          element={
            <ProtectedRoute memberOnly>
              <MyBooks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/issue-return"
          element={
            <ProtectedRoute adminOnly>
              <IssueReturn />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

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
