"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Discuss } from "react-loader-spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form with Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/signin/",
        data,
        { withCredentials: true }
      );

      if (response.data.status === "successful") {
        if (response.data.isSuperUser) {
          router.push("/adminpanel");
        } else if (response.data.hasUserProfilePicture) {
          router.push("/userdashboard");
        } else {
          router.push("/uploadprofilepicture");
        }
      } else {
        toast.error("Email or Password don't match", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
      }
    } catch (err) {
      console.log(err.message);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden py-10">
      <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-gray-700 to-gray-600 rounded-full opacity-30 transform rotate-45 z-0"></div>
      <div className="absolute -top-40 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-gray-600 to-gray-700 rounded-full opacity-30 transform rotate-45 z-0"></div>

      <div className="relative z-10 bg-white p-10 rounded-lg shadow-lg w-full max-w-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
        {isLoading && <Discuss color="purple" />}
        <div className="flex justify-center mb-6">
          <img src="/logo/logo.png" alt="ChatForum Logo" className="w-20 h-20" />
        </div>
        <h2 className="text-4xl font-extrabold mb-2 text-center text-gray-700">
          Welcome Back to ChatForum!
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Please log in to access your chat rooms and conversations.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-700 text-white p-3 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-300"
          >
            Log In
          </button>
          <ToastContainer />
          <div className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link href="/" className="text-gray-700 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
