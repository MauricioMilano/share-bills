
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let user: { role?: string } | null = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (e) {
      user = null;
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link to="/" className="font-bold">
          Splitwise Clone
        </Link>
        {token && (
          <>
            <Link to="/groups">Groups</Link>
            <Link to="/notifications">Notifications</Link>
            {/* Show 'Usuários' only for Admins */}
            {user?.role === 'ADMIN' && <Link to="/users">Usuários</Link>}
          </>
        )}
      </div>
      <div>
        {token ? (
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="mr-3">
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}