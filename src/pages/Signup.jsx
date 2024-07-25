import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const notify1 = (msg) => toast.error(msg);
  const notify2 = (msg) => toast.success(msg);

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

  const sendData = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      notify1("Invalid email format");
      return;
    }
    if (!passwordRegex.test(password)) {
      notify1(
        "Invalid password format,  must contain a number, must contain one lowercase, must contain one uppercase, must contain one special character, password must be 8-16 characters long"
      );
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/signup`, {
        name,
        username,
        email,
        password,
      });

      notify2(response.data.message);
      navigate("/signin");
    } catch (error) {
      if (error.response) {
        notify1(error.response.data.message);
      } else {
        notify1(error.message);
      }
      navigate("/signup");
    }
  };

  return (
    <div className=" bg-[url(./assets/images/main_bg.jfif)] bg-no-repeat bg-cover h-screen">
      <div className="container mx-auto ">
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-100 p-10 rounded-md text-center">
            <img className="w-40 mx-auto" src={logo} alt="" />
            <h1 className="mb-5 text-xl font-semibold text-gray-600">
              Sign up to see photos and videos <br /> from your friends.
            </h1>
            <form className="flex flex-col gap-2" onSubmit={sendData}>
              <input
                className="mb-3 p-2 rounded-sm"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <input
                className="mb-3 p-2 rounded-sm"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
              <input
                className="mb-3 p-2 rounded-sm"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <input
                className="mb-3 p-2 rounded-sm"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <button className=" bg-blue-500 text-white rounded-md py-1 my-4" type="submit">
                Sign up
              </button>
              <p>
                Already have an account?{" "}
                <Link className="text-blue-600" to="/signin">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
