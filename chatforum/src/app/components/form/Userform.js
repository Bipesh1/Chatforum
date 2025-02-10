"use client";
import React from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the validation schema using Zod
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Userform() {
  const router = useRouter();

  // Initialize react-hook-form with Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/register/",
        data
      );
      if (response.data.status === "successful") {
        router.push("/login");
      }
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden py-10">
      {/* Background Design */}
      <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-gray-700 to-gray-600 rounded-full opacity-30 transform rotate-45 z-0"></div>
      <div className="absolute -top-40 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-gray-600 to-gray-700 rounded-full opacity-30 transform rotate-45 z-0"></div>

      {/* Signup Form */}
      <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <div className="flex justify-center mb-6">
          <img src="/logo/logo.png" alt="ChatForum Logo" className=" w-20 h-20" />
        </div>
        <h2 className="text-4xl font-extrabold mb-2 text-center text-gray-700">
          Join ChatForum
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Connect, Share, and Engage with the Community!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              type="text"
              {...register("username")}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-700 text-white p-3 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-300"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-700 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
