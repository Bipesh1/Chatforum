"use client"
import React from 'react'
import Layout from '../components/layout/Layout'
import getcsrftoken from '@/helpers/getcsrftoken'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ThreeDots } from 'react-loader-spinner'
import { FaTrash } from 'react-icons/fa'


export default function page() {
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [totalUsers, setTotalUsers] = useState(0)

    useEffect(() => {
        getUsers()
    }, [])

    const getUsers = async () => {
        const csrftoken = await getcsrftoken()
        try {
            setIsLoading(true)
            const response = await axios.get('http://localhost:8000/api/getusers', {
                headers: {
                    "X-CSRFToken": csrftoken.value,
                },
                withCredentials: true,
            });
            if (response.data.status == 'successful') {
                setUsers(response.data.users);
                setTotalUsers(response.data.users.length);
            }
            else {
                setUsers([])
                setTotalUsers(0)
            }
        } catch (err) {
            console.log(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (userid) => {
        const csrftoken = await getcsrftoken()
        try {
            setIsLoading(true)
            const response = await axios.post('http://localhost:8000/api/deleteusers/', { userid: userid }, {
                headers: {
                    "X-CSRFToken": csrftoken.value,
                },
                withCredentials: true,
            });
            if (response.data.status == 'successful') {
                await getUsers()
            }
        } catch (err) {
            console.log(err.message)
        } finally {
            setIsLoading(false)
        }
    };


    return (
        <Layout>
            <div className="min-h-screen p-4 md:p-8">
                {/* Heading Section */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                    Total Users : {totalUsers}
                </h1>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    {isLoading && <ThreeDots height="80" width="80" color="#4fa94d" radius="9" ariaLabel="three-dots-loading" />}
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2 text-left text-gray-800">User ID</th>
                                <th className="px-4 py-2 text-left text-gray-800">Username</th>
                                <th className="px-4 py-2 text-left text-gray-800">Email</th>
                                <th className="px-4 py-2 text-left text-gray-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={user % 2 === 0 ? "bg-white" : "bg-gray-100"}
                                >
                                    <td className="border px-4 mx-3 py-2 ">{user.id}</td>
                                    <td className="border px-4 mx-3 py-2 ">{user.username}</td>
                                    <td className="border px-4 mx-3 py-2 ">{user.email}</td>
                                    <td className="border px-4 mx-3 py-2 gap-2 ">
                                        <button className="text-red-500 hover:text-red-700  w-4 h-6" onClick={() => handleDelete(user.id)}
                                        ><FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    )
}
