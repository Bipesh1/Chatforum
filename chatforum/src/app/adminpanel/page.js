"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import getcsrftoken from "@/helpers/getcsrftoken";
import Navbar from "../components/navbar/Navbar";

import { useRouter } from "next/navigation";
import Layout from "../components/layout/Layout";
import { IoIosNotifications } from "react-icons/io";

export default function AdminPanel() {
    const router = useRouter();
    const [profileUrl, setProfileUrl] = useState("");
    const [profileDetails, setProfileDetails] = useState({});

    useEffect(() => {
        getUserProfile();
    }, []);

    const getUserProfile = async () => {
        const csrftoken = await getcsrftoken();
        const response = await axios.get(
            "http://localhost:8000/api/getprofiledata/",
            {
                headers: {
                    "X-CSRFToken": csrftoken.value,
                },
                withCredentials: true,
            }
        );
        setProfileUrl(response.data.profile.profile_picture_url);
        setProfileDetails(response.data.user);
    };

    return (
        <Layout>
            <div className="min-h-screen flex flex-col">
                <div className="p-4 md:p-8">
                    {/* Profile and Notifications Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 md:p-8 rounded-3xl shadow-md mb-8">
                        <div className="flex items-center space-x-4 md:space-x-6">
                            <img
                                src={profileUrl}
                                className="rounded-full shadow-gray-600 shadow-lg w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40"
                                alt="Profile"
                            />
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">
                                    {profileDetails.username}
                                </h2>
                                <p className="text-gray-500">
                                    Welcome back! Here’s your activity overview.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button className="px-4 py-2 md:px-6 md:py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-between">
                                <IoIosNotifications className="text-xl" /> View Latest
                                Notifications
                            </button>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-2xl shadow-lg text-center text-white">
                            <h3 className="text-3xl md:text-4xl font-bold">94</h3>
                            <p className="mt-2 text-sm md:text-base">Threads Joined</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-lg text-center text-white">
                            <h3 className="text-3xl md:text-4xl font-bold">512</h3>
                            <p className="mt-2 text-sm md:text-base">Contributions</p>
                        </div>
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-2xl shadow-lg text-center text-white">
                            <h3 className="text-3xl md:text-4xl font-bold">10</h3>
                            <p className="mt-2 text-sm md:text-base">Total Rooms</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-2xl shadow-lg text-center text-white">
                            <h3 className="text-3xl md:text-4xl font-bold">10</h3>
                            <p className="mt-2 text-sm md:text-base">Total Users</p>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="mt-8">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div
                                onClick={() => router.push("/roomstats")}
                                className="cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-2xl shadow-lg text-center text-white hover:shadow-xl transition-all"
                            >
                                <h3 className="text-2xl md:text-3xl font-bold">View Rooms</h3>
                            </div>
                            <div
                                onClick={() => router.push("/userstats")}
                                className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-lg text-center text-white hover:shadow-xl transition-all"
                            >
                                <h3 className="text-2xl md:text-3xl font-bold">View Users</h3>
                            </div>
                            <div
                                onClick={() => router.push("/threads")}
                                className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-2xl shadow-lg text-center text-white hover:shadow-xl transition-all"
                            >
                                <h3 className="text-2xl md:text-3xl font-bold">Joined Threads</h3>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-8">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                            Recent Activity
                        </h2>
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md">
                            <p className="text-gray-600 text-sm md:text-base">
                                You have no recent activities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
