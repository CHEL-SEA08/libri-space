
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to="/books">📚 LibriSpace</Link>

      <nav>
        <Link to="/books">Books</Link>

        {user && <Link to="/my-books">My Books</Link>}

        {user?.role === "admin" && (
          <>
            <Link to="/admin">Admin</Link>
            <Link to="/issue-return">Issue / Return</Link>
          </>
        )}

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </nav>
    </header>
  );
}
