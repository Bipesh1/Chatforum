"use client";
import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import getcsrftoken from "@/helpers/getcsrftoken";
import { IoSearchSharp } from "react-icons/io5";
import { MagnifyingGlass } from 'react-loader-spinner'
import ThreadCard from "../components/threadcard/Threadcard";

export default function Room() {

    const [threadquery, setThreadQuery] = useState({
        query: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [threads, setThreads] = useState([])


    useEffect(() => {

    }, [])


    const handleSubmitThreadQueries = async () => {
        try {
            setThreads([])
            setIsLoading(true)
            const csrftoken = await getcsrftoken()
            const response = await axios.post(`http://localhost:8000/api/getallthreads/`, threadquery, {
                headers: { "X-CSRFToken": csrftoken.value },
                withCredentials: true,
            })
            console.log(response.data.threads)
            console.log(response.data)
            setThreads(response.data.threads)
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <Layout>
            <div className="bg-gray-100 p-8 min-h-screen">
                <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-10">
                    Available Rooms
                </h2>

                <div className="mb-10 flex justify-center">
                    <div className="bg-white w-1/2 flex justify-center items-center p-2 rounded-md gap-x-3 shadow-gray-500 shadow-sm">
                        <IoSearchSharp className=" text-xl" />
                        <input name="query" type="search" className="outline-none w-full" placeholder="Search Specific Threads" onChange={(e) => setThreadQuery({ [e.target.name]: e.target.value })} />
                        <button className=" text-gray-600" onClick={handleSubmitThreadQueries}>Search</button>
                    </div>
                </div>

                {isLoading && <MagnifyingGlass />}
                <div className="space-y-4 mt-10">
                    {threads.map((thread) => (
                        <div key={thread.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">

                            <p className="text-sm text-gray-600 font-semibold">
                                Room: {thread.roomname}
                            </p>
                            <ThreadCard
                                id={thread.id}
                                title={thread.title}
                                description={thread.description}
                                roomname={thread.roomname}
                                created_by={thread.created_by['username'] || thread.created_by}
                                basepath={"/rooms"}
                            />
                            <p className="text-sm text-gray-600 font-semibold">
                                Similarity Score: {thread.similarity_score}
                            </p>
                        </div>
                    ))}
                </div>


            </div>
        </Layout>
    );
}