"use client";
import React, { useEffect, useState } from "react";
import getcsrftoken from "@/helpers/getcsrftoken";
import axios from "axios";

export default function Page({ params }) {
  const [messages, setMessages] = useState([]); // Ensure it's always an array
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle any errors

  const getMessages = async () => {
    try {
      const csrftoken = await getcsrftoken();
      const messagesResponse = await axios.get(
        `http://localhost:8000/api/getMessages/${params.id}/`,
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true,
        }
      );
      // Ensure messagesResponse.data.message is an array before setting state
      if (Array.isArray(messagesResponse.data.message)) {
        setMessages(messagesResponse.data.message);
      } else {
        setMessages([]); // Set an empty array if data is not an array
      }
      setLoading(false); // Stop loading once the messages are fetched
    } catch (err) {
      setError("Failed to fetch messages.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getMessages();
  }, []);

  // Sort messages by upvotes only if there are any messages
  const sortedMessages = Array.isArray(messages) && messages.length > 0 ? messages.sort((a, b) => b.upvote - a.upvote) : [];

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 min-h-screen flex flex-col justify-center items-center p-10">
      <div className="w-full max-w-5xl p-8 bg-white rounded-3xl shadow-2xl">
        <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-12">
          Top Upvoted Messages
        </h1>

        {loading ? (
          <div className="text-2xl text-gray-600 text-center">Loading...</div>
        ) : error ? (
          <div className="text-2xl text-red-600 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-2xl text-gray-600 text-center">No messages available.</div>
        ) : (
          <div className="space-y-8">
            {sortedMessages.map((message, index) => (
               message.upvote>=1 &&(
              <div
                key={index}
                className={`p-6 rounded-2xl border-4 ${
                  message.upvote > 10
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 bg-white"
                } shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
              >
           
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-gray-800">
                    {message.upvote} Upvotes
                  </span>
                  <div className="text-sm text-gray-500">{message.timestamp}</div>
                </div>
                <div className="text-xl text-gray-800">{message.content}</div>
              </div>)
            
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
