"use client";
import Layout from "@/app/components/layout/Layout";
import React, { useEffect, useState } from "react";
import ThreadCard from "@/app/components/threadcard/Threadcard";
import axios from "axios";
import getcsrftoken from "@/helpers/getcsrftoken";
import Link from "next/link";

export default function RoomPage({ params }) {
  const [threads, setThreads] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");

  // Run this effect only when the component is mounted, not on thread state updates
  useEffect(() => {
    getThreads();
  }, []);  // Empty dependency array to run the effect once on component mount

  // Fetch existing threads from the backend
  const getThreads = async () => {
    const csrftoken = await getcsrftoken();
    try {
      const response = await axios.get(
        `http://localhost:8000/api/${params.name}/getthreads/`,
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true,
        }
      );
      console.log(response);
      if (response.data.status === "successful") {
        setThreads(response.data.threads); // This will update the state once after fetching
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // Handle the addition of a new thread
  const handleAddThread = async () => {
    const csrftoken = await getcsrftoken();
    const threadDetails = {
      roomName: params.name,
      title: newThreadTitle,
    };

    try {
      const response = await axios.post(
        `http://localhost:8000/api/${params.name}/addthread/`,
        threadDetails,
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true,
        }
      );
      if (response.data.status === "successful") {
        await getThreads() // Manually update the threads state
        setIsPopupOpen(false); // Close the modal after submission
        setNewThreadTitle(""); // Reset the title input
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
          {params.name} Threads
        </h2>
        <Link href="#" passHref>
          <span
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={() => setIsPopupOpen(true)}
          >
            Add New Thread
          </span>
        </Link>

        <div className="space-y-4">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              id={thread.id}
              title={thread.title}
              description={thread.description}
              roomname={params.name}
              created_by={thread.created_by['username']}
              basepath={"/rooms"}
            />
          ))}
        </div>
      </div>

      {/* Modal for Adding a Thread */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Create a New Thread</h3>
            <input
              type="text"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-md focus:outline-none"
              placeholder="Thread title"
              required
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setIsPopupOpen(false);
                  setNewThreadTitle(""); // Reset on cancel
                }}
              >
                Cancel
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-md"
                onClick={handleAddThread}
              >
                Add Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
