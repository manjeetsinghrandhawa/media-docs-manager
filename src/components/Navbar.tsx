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
    <div className="flex items-center justify-between px-6 py-6 bg-gray-900 text-white shadow-md">
      <div className=" flex items-center gap-2">
        
        <h2 className="text-bold text-4xl pl-6">Media & Docs Manager</h2>
          
        
      </div>

      <div className="flex items-center gap-10 pr-6">
        {!token ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition"
            >
              Login
              {" "}
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Signup
            </Link>
          </>
        ) : (
          <>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
