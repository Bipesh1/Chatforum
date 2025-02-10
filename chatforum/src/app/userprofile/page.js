'use client'
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/Navbar';
import Layout from '../components/layout/Layout';
import { IoIosCreate } from 'react-icons/io';
import getcsrftoken from '@/helpers/getcsrftoken';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Single Zod schema for both username and password validation
const userProfileSchema = z.object({
    username: z.string().min(5, "Username must be atleast 5 characters").max(100, "Username is too long"),
    oldpassword: z.string().min(6, "Old password must be at least 6 characters").optional(),
    newpassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

export default function page() {
    const router = useRouter();
    const [profileUrl, setProfileUrl] = useState("");
    const [profileDetails, setProfileDetails] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editPasswordPopup, setEditPasswordPopup] = useState(false);
    const [editUsernamePopup, setEditUsernamePopup] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userProfileSchema), // Use the combined schema for validation
    });

    useEffect(() => {
        getUserProfile();
    }, []);

    const handleEditUsername = () => {
        setEditUsernamePopup(true);
    };

    const handleChangePassword = () => {
        setEditPasswordPopup(true);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const csrftoken = await getcsrftoken();

            // Handle updating username
            if (data.username) {
                const response = await axios.post("http://localhost:8000/api/updateInfo", {
                    type: "username",
                    username: data.username,
                }, {
                    headers: { "X-CSRFToken": csrftoken.value },
                    withCredentials: true,
                });

                if (response.data.status === 'successful') {
                    console.log('Username Changed Successfully');
                    getUserProfile();
                } else {
                    console.error(response.data.message);
                }
            }

            // Handle updating password
            if (data.oldpassword && data.newpassword) {
                const response = await axios.post("http://localhost:8000/api/updateInfo", {
                    type: "password",
                    data,
                }, {
                    headers: { "X-CSRFToken": csrftoken.value },
                    withCredentials: true,
                });

                if (response.data.status === 'successful') {
                    await axios.get("/api/logout", {
                        withCredentials: true,
                    });
                    console.log(response.data);
                    router.push('/login');
                } else {
                    console.error(response.data);
                    toast.error("Old password doesn't match", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                    });
                }
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

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

        setProfileUrl(response.data.profile?.profile_picture_url);
        setProfileDetails(response.data.user);
    };

    return (
        <Layout>
            <div className="min-h-screen flex flex-col">
                <div className="p-4 md:p-8">
                    <div className="flex flex-col items-center bg-white p-6 md:p-8 rounded-3xl shadow-md mb-8">
                        <div className="relative">
                            <img
                                src={profileUrl ? profileUrl : '/noprofileimage/npc.png'}
                                className="rounded-full shadow-gray-600 shadow-lg w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                                alt="Profile"
                            />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize mt-4">
                            {profileDetails.username}
                        </h2>
                        <Link href="/uploadprofilepicture" className="text-blue p-3">
                            Choose another profile
                        </Link>
                    </div>

                    <div className="mt-8 space-y-2">
                        <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center mx-11 max-w-md">
                            <label className="text-gray-800 text-lg font-semibold">
                                Username
                            </label>
                            <>
                                <span className="ml-4 text-gray-600">
                                    {profileDetails.username}
                                </span>
                                <button
                                    className="ml-2 text-indigo-600 flex items-center"
                                    onClick={handleEditUsername}
                                >
                                    Edit
                                </button>
                            </>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center mx-11 max-w-md">
                            <button
                                className="ml-2 text-indigo-600 flex items-center"
                                onClick={handleChangePassword}
                            >
                                Change your password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {editPasswordPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Edit Profile</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-gray-800 text-lg font-semibold mb-2">Old Password</label>
                                <input
                                    {...register("oldpassword")}
                                    type="password"
                                    placeholder="Old Password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                                {errors.oldpassword && <span className='text-red-500'>{errors.oldpassword.message}</span>}

                                <label className="block text-gray-800 text-lg font-semibold mb-2">New Password</label>
                                <input
                                    {...register("newpassword")}
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                                {errors.newpassword && <span className='text-red-500'>{errors.newpassword.message}</span>}
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                    onClick={() => setEditPasswordPopup(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="px-6 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                    <ToastContainer />
                </div>
            )}

            {editUsernamePopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Edit Profile</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-gray-800 text-lg font-semibold mb-2">Username</label>
                                <input
                                    {...register("username")}
                                    type="text"
                                    placeholder={profileDetails.username}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                                {errors.username && <span className='text-red-500'>{errors.username.message}</span>}
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                    onClick={() => setEditUsernamePopup(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="px-6 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
