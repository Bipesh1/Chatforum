'use client'
import React from 'react'
import Navbar from '../components/navbar/Navbar'
import Layout from '../components/layout/Layout'
import { IoIosCreate } from 'react-icons/io';
import { useState, useEffect } from 'react';
import getcsrftoken from '@/helpers/getcsrftoken';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export default function page() {
    const router= useRouter()
    const [profileUrl, setProfileUrl] = useState("");
    const [profileDetails, setProfileDetails] = useState({});
    const [newUsername, setNewUserName] = useState("")
    const [passwordData, setPasswordData]=useState({})
    useEffect(() => {
        getUserProfile();
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editPasswordPopup, setEditPasswordPopup] = useState(false);
    const [editUsernamePopup, setEditUsernamePopup] = useState(false);

    const handleEditUsername = () => {
        setEditUsernamePopup(true)
    }
    const handleChangePassword = () => {
        setEditPasswordPopup(true)
    }

    const handleSubmitUsername = async (e) => {
        e.preventDefault()
        setIsSubmitting(true); // Disable button
        console.log(newUsername)
        try {
            const csrftoken = await getcsrftoken();
            const response = await axios.post("http://localhost:8000/api/updateInfo", {
                type: "username",
                username: newUsername,
            }, {
                headers: { "X-CSRFToken": csrftoken.value },
                withCredentials: true,
            });

            if (response.data.status === 'successful') {
                console.log('Username Changed Successfully');
                // Fetch updated profile
                getUserProfile();
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating username:', error);
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    }
    const handleSubmitPassword = async (e) => {
        e.preventDefault()
        setIsSubmitting(true); // Disable button
        try {
            const csrftoken = await getcsrftoken();
            const response = await axios.post("http://localhost:8000/api/updateInfo", {
                type: "password",
                data: passwordData,
            }, {
                headers: { "X-CSRFToken": csrftoken.value },
                withCredentials: true,
            });

            if (response.data.status === 'successful') {
                // Invalidate the session by logging out
                await axios.get("/api/logout", {
                    withCredentials: true,
                });
                console.log(response.data);
                router.push('/login')

                // Fetch updated profile
                // getUserProfile();
            } else {
                console.error(response.data);
            }
        } catch (error) {
            console.error('Error updating password:', error);
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    }

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
                    <div className="flex flex-col items-center bg-white p-6 md:p-8 rounded-3xl shadow-md mb-8">
                        <div className="relative">
                            <img
                                src={profileUrl}
                                className="rounded-full shadow-gray-600 shadow-lg w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                                alt="Profile"
                            />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize mt-4">
                            {profileDetails.username}
                        </h2>
                        <Link href="/uploadprofilepicture" className="text-blue p-3"
                        >
                            Choose another profile
                        </Link>
                    </div>

                    <div className="mt-8 space-y-2">
                        <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center mx-11 max-w-md">
                            <label className="text-gray-800 text-lg font-semibold ">
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
                        {/* <div className="mx-11 gap-3">
                            <button
                                className=" mt-5 text-white p-3 bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
                                onClick={handleEdit}
                            >
                                Update Profile Data
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
            {editPasswordPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Edit Profile</h3>
                        <form onSubmit={handleSubmitPassword} className="space-y-4">

                            <div>
                                <label className="block text-gray-800 text-lg font-semibold mb-2">Old Password</label>
                                <input
                                    name='oldpassword'
                                    type='text'
                                    onChange={(e) => setPasswordData({...passwordData,[e.target.name]:e.target.value})}
                                    placeholder="Old Password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    required
                                />
                                 <label className="block text-gray-800 text-lg font-semibold mb-2">New Password</label>
                                <input
                                    name='newpassword'
                                    type='text'
                                    onChange={(e) => setPasswordData({...passwordData,[e.target.name]:e.target.value})}
                                    placeholder="New Password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    required
                                />
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
                </div>
            )}

            {editUsernamePopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Edit Profile</h3>
                        <form onSubmit={handleSubmitUsername} className="space-y-4">
                            <div>
                                <label className="block text-gray-800 text-lg font-semibold mb-2">Email</label>
                                <input
                                    type='text'
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder={profileDetails.username}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
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

    )
}
