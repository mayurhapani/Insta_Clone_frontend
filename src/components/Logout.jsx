import { useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function Logout() {
  const { setIsLoggedIn, setLogInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    let isMounted = true;

    const logout = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/logout`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (response.status === 200 && isMounted) {
          localStorage.removeItem("token");
          localStorage.removeItem("id");

          // Attempt to remove cookies with specific attributes
          cookies.remove("token", {
            path: "/",
            domain: window.location.hostname,
            sameSite: "None",
            secure: true,
          });
          cookies.remove("token"); // Fallback

          setIsLoggedIn(false);
          setLogInUser({});
          toast.success(response.data.message);
          navigate("/");
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Logout failed. Please try again.");
        }
      }
    };

    logout();

    return () => {
      isMounted = false;
    };
  }, [navigate, setIsLoggedIn, setLogInUser]);

  return null;
}
