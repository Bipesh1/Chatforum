"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Discuss } from 'react-loader-spinner'

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState({ email: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true)
    // let csrftoken= await getcsrftoken()
    try {
      const response = await axios.post(
        "http://localhost:8000/api/signin/",
        userDetails,
        {
          withCredentials: true,
        }
      );
      console.log(response);
      if (
        response.data.status == "successful" &&
        response.data.isSuperUser==true
        
      ) {
        router.push("/adminpanel");
        console.log("adminpanel")
      } else if (response.data.status == "successful" && response.data.hasUserProfilePicture == true) {
        router.push("/userdashboard");
        console.log("user with profile")
      }
      else if(response.data.status=="successful"){
        router.push("/uploadprofilepicture")
        console.log('user with no profile')
      } else if (response.data.status == "error") {
        toast.error("Email or Password don't match", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      }
    } catch (err) {
      console.log(err.message)
    }
    finally {
      setIsLoading(false)
    }

    // Implement login logic here
    console.log("Logging in with:", userDetails);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
      {/* Background Oval Design */}
      <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-700 to-blue-700 rounded-full opacity-30 transform rotate-45 "></div>
      <div className="absolute -top-40 -right-20 w-[700px] h-[700px] bg-gradient-to-r from-blue-700 to-purple-700 rounded-full opacity-30 transform rotate-45 "></div>

      {/* Login Form */}
      <div className="relative z-10 bg-white p-10 rounded-lg shadow-lg w-full max-w-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
        {isLoading && <Discuss color="purple" />}
        <div className="flex justify-center mb-6">
          <img
            src="/logo/logo.png"
            alt="ChatForum Logo"
            className=" w-20 h-20"
          />
        </div>
        <h2 className="text-4xl font-extrabold mb-2 text-center text-purple-700">
          Welcome Back to ChatForum!
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Please log in to access your chat rooms and conversations.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={userDetails.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-700 text-white p-3 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-300"
          >
            Log In
          </button>
          <ToastContainer />
          <div className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link href="/" className="text-purple-700 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
