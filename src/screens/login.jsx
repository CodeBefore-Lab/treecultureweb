import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { sendRequest } from "../utils/requests";
import ThemeContext from "../context";
import Dashboard from "./dashboard";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  // Redirect the user to the dashboard
  //navigate react router dom
  //useNavigate

  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Here you would usually send a request to your backend to authenticate the user
    // For the sake of this example, we're using a mock authentication
    // Replace with actual authentication logic
    await login({ username, password });
  };

  return (
    <div className="bg-gradient-to-r from-green-400 to-green-600">
      <div className="h-screen overflow-y-auto flex items-center justify-center ">
        <div className="bg-white rounded-2xl flex justify-center shadow-2xl shadow-slate-600 m-5">
          <img
            src="https://picsum.photos/id/28/750/300"
            className="rounded-l-2xl hidden
          lg:block object-cover
          
          "
            alt="logo"
          />

          <div className="flex flex-col justify-center items-center p-12">
            <div
              className="text-2xl
            text-green-600
            font-bold"
            >
              Welcome to the app
            </div>

            <div className="text-md font-bold">Please login to continue</div>
            <div>
              <form onSubmit={handleLogin} className="flex flex-col w-full gap-5 mt-4">
                <div>
                  <input
                    className="border-2 border-gray-300 rounded-md p-2 w-full"
                    id="username"
                    type="text"
                    value={username}
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    className="border-2 border-gray-300 rounded-md p-2 w-full"
                    id="password"
                    type="password"
                    value={password}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className="bg-green-600 shadow-md text-white p-2 mt-4 rounded-md" type="submit">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
