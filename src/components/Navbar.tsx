import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setToken } from "../slices/authSlice";

function Navbar() {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(setToken(null));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="glass-nav sticky top-0 z-40 w-full">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <Link to="/" className="group">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Workspace</p>
          <h2 className="text-2xl font-bold text-white transition group-hover:text-cyan-100 sm:text-3xl">Media and Docs Manager</h2>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
        {!token ? (
          <>
            <Link
              to="/login"
              className="btn-ghost px-4 py-2 text-sm font-semibold"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn-primary px-4 py-2 text-sm"
            >
              Signup
            </Link>
          </>
        ) : (
          <>
            
            <button
              onClick={handleLogout}
              className="btn-ghost px-4 py-2 text-sm font-semibold"
            >
              Logout
            </button>
          </>
        )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
