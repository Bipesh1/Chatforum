"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import getcsrftoken from "@/helpers/getcsrftoken";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function AdminLogin() {
    const router = useRouter();
    const [adminDetails, setAdminDetails] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setAdminDetails({ ...adminDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let csrftoken = await getcsrftoken();
            const response = await axios.post(
                "http://localhost:8000/api/signin/",
                adminDetails,
            );

            if (response.data.message === "Invalid Credentials") {
                toast.error("Invalid email or password", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                });
            }

            if (response.data.status === "successful") {
                router.push("/adminpanel"); // Redirect to admin dashboard on successful login
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again later.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden py-10">
            <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-gray-700 to-gray-600 rounded-full opacity-30 transform rotate-45 z-0"></div>
            <div className="absolute -top-40 -right-20 w-[700px] h-[700px] bg-gradient-to-r from-gray-600 to-gray-700 rounded-full opacity-30 transform rotate-45 z-0"></div>
            <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="flex justify-center mb-6">
                    <img
                        src="/logo/logo.png"
                        alt="Admin Panel Logo"
                        className="w-20 h-20"
                    />
                </div>
                <h2 className="text-4xl font-extrabold mb-2 text-center text-gray-700">
                    Admin Login
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    Access the Admin Dashboard
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium">email</label>
                        <input
                            type="email"
                            name="email"
                            value={adminDetails.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={adminDetails.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-700 text-white p-3 rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-300"
                    >
                        Login
                    </button>
                    <ToastContainer />
                </form>
                <div className="mt-6 text-center text-gray-600">
                    <Link href="/" className="text-gray-700 hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
