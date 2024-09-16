"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/layout/Layout";
import { FaEye, FaTrash, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import getcsrftoken from "@/helpers/getcsrftoken";
import { ThreeDots } from "react-loader-spinner";




export default function RoomStats() {
    const [rooms, setRooms] = useState([]);
    const [totalRooms, setTotalRooms] = useState(0);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const [roomDetails, setroomDetails] = useState({
        name: "",
        description: ""
    })

    const handleInputChange = (e) => {
        setroomDetails({ ...roomDetails, [e.target.name]: e.target.value });
        console.log(roomDetails);
    };

    useEffect(() => {
        fetchRooms();
    }, []);


    const fetchRooms = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get("http://localhost:8000/api/getavailablerooms");
            if (response.data.status == 'successful') {
                setRooms(response.data.rooms);
                setTotalRooms(response.data.rooms.length);
            }
            else {
                setRooms([])
                setTotalRooms(0)
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setIsLoading(false)
        }
    };

    const handleDelete = async (roomname) => {
        const csrftoken = await getcsrftoken()
        try {
            setIsLoading(true)
            const response = await axios.get(`http://localhost:8000/api/deleterooms/${roomname}`,
                {
                    headers: { "X-CSRFToken": csrftoken.value },
                    withCredentials: true
                });
            if (response.data.status == "successful") {
                console.log("Data Deleted")
                await fetchRooms()
            }

        } catch (err) {
            console.log(err.message)
        } finally {
            setIsLoading(false)
        }
    }


    const handleRoomAdd = async () => {
        const csrftoken = await getcsrftoken()
        setIsLoading(true)
        try {

            const response = await axios.post(`http://localhost:8000/api/addrooms/`,
                JSON.stringify(roomDetails)
                ,
                {
                    headers: { "X-CSRFToken": csrftoken.value, 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            if (response.data.status == "successful") {
                console.log("Room added")
                // alert("Deleted Successfully")
                setIsPopupOpen(false)
                setroomDetails({
                    name: "",
                    description: ""
                });
                await fetchRooms()
            }
        } catch (err) {
            console.log(err.message)
        } finally {
            setIsLoading(false)
        }

    }


    const enterRoom = (roomname) => {
        router.push(`/roomstats/${roomname}`);
    };

    return (
        <Layout>
            <div className="min-h-screen p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Total Rooms: {totalRooms}
                    </h1>

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex text-center justify-center gap-2"
                        onClick={() => setIsPopupOpen(true)}
                    >
                        <FaPlus className="text-white mt-1"></FaPlus>Add Room
                    </button>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    {isLoading && <ThreeDots height="80" width="80" color="#4fa94d" radius="9" ariaLabel="three-dots-loading" />}
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2 text-left text-gray-800">Room ID</th>
                                <th className="px-4 py-2 text-left text-gray-800">Room Name</th>
                                <th className="px-4 py-2 text-left text-gray-800">Created At</th>
                                <th className="px-4 py-2 text-left text-gray-800">Total Users</th>
                                <th className="px-4 py-2 text-left text-gray-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(rooms && rooms.length > 0 ? rooms : []).map((room, index) => (
                                <tr
                                    key={room.id}
                                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                                >
                                    <td className="border px-4 py-2">{room.id}</td>
                                    <td className="border px-4 py-2">{room.name}</td>
                                    <td className="border px-4 py-2">{room.created_at}</td>
                                    <td className="border px-4 py-2">{room.user_count}</td>
                                    <td className="border px-4 py-2 flex flex-row gap-2">
                                        <div className="min-h-full flex space-x-4 justify-center items-center">
                                            <button className="text-blue-500 hover:text-blue-700 inline-block w-4 h-6" onClick={() => enterRoom(room.name)}>
                                                <FaEye />
                                            </button>

                                            <button
                                                className="text-red-500 hover:text-red-700 inline-block w-4 h-6"
                                                onClick={() => handleDelete(room.name)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Create a Room</h3>
                        <input
                            type="text"
                            name="name"
                            value={roomDetails.name}
                            onChange={handleInputChange}
                            className="border border-gray-300 p-3 m-2 w-full rounded-md focus:outline-none"
                            placeholder="Room Name"
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            value={roomDetails.description}
                            onChange={handleInputChange}
                            className="border border-gray-300 p-3 m-2 w-full rounded-md focus:outline-none"
                            placeholder="Description "
                            required
                        />
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                onClick={() => {
                                    setIsPopupOpen(false);
                                    setroomDetails({
                                        name: "",
                                        description: "",
                                    });
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-purple-600 text-white px-4 py-2 rounded-md"
                                onClick={handleRoomAdd}
                            >
                                Add Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );

};