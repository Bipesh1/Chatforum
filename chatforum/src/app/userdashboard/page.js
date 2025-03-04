"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import getcsrftoken from "@/helpers/getcsrftoken";
import { IoIosNotifications } from "react-icons/io";
import { useRouter } from "next/navigation";
import Layout from "../components/layout/Layout";
import Link from "next/link";

export default function UserDashboard() {
  const router = useRouter();
  let createdThreads=[]
  const [profileUrl, setProfileUrl] = useState("");
  const [profileDetails, setProfileDetails] = useState({});
  const [recentThreads, setRecentThreads] = useState([]);
  const [joinedThreadsLength, setJoinedThreadsLength] = useState(null)
  const [createdThreadsLength, setCreatedThreadsLength] = useState(null)
  const [joinedRoomsLength, setJoinedRoomsLength] = useState(null)

  useEffect(() => {
    getUserProfile();
    getJoinedThreads();
    getJoinedRooms();
    getCreatedThreads();
    

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
    if(response.data.profile && response.data.profile.profile_picture_url){
    setProfileUrl(response.data.profile.profile_picture_url);
    }
    setProfileDetails(response.data.user);
  };
  const getJoinedThreads = async () => {
    const csrftoken = await getcsrftoken()
    const response = await axios.get("http://localhost:8000/api/getJoinedThreads/", {
      headers: {
        "X-CSRFToken": csrftoken.value, // Include the CSRF token in the request headers
      },
      withCredentials: true,
    })
    createdThreads= response.data.data 

    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      setJoinedThreadsLength(response.data.data.length);
      filterthreads(createdThreads);
    } else {
      setJoinedThreadsLength(0);  // Set to 0 or another appropriate default value
    }
    
    // setRoomName(response.data.data.room.name)
  }
  const getJoinedRooms = async () => {
    const csrftoken = await getcsrftoken();
    const response = await axios.get("http://localhost:8000/api/getJoinedRooms/",
      {
        headers: {
          "X-CSRFToken": csrftoken.value,
        }, withCredentials: true,
      }
    )
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      setJoinedRoomsLength(response.data.data.length);
    } else {
      setJoinedThreadsLength(0)
    }
  }
  const getCreatedThreads = async () => {
    const csrftoken = await getcsrftoken();
    const response = await axios.get("http://localhost:8000/api/getCreatedThreads/",
      {
        headers: {
          "X-CSRFToken": csrftoken.value,
        }, withCredentials: true,
      }
    )
    createdThreads = response.data.data
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      setCreatedThreadsLength(response.data.data.length);
      filterthreads(response.data.data)
    } else {
      setCreatedThreadsLength(0)
    }
  }

  const filterthreads=(allThreads)=>{
    const twodaysago = new Date()
    twodaysago.setDate(twodaysago.getDate()-2)

    const recent = allThreads.filter((thread)=>{
      const threadDate= new Date(thread.created_at)
      return threadDate>= twodaysago
    })
    setRecentThreads(recent)
  }
  return (
    <Layout>
      <div className="min-h-screen flex flex-col ">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 md:p-8 rounded-3xl shadow-md mb-8">
            <div className="flex items-center space-x-4 md:space-x-6">
              <img
                src={profileUrl?profileUrl:"/noprofileimage/npc.png"}
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
                <button className="px-4 py-2 my-2 text-white rounded-lg shadow-md bg-blue-500  hover:bg-blue-700 transition">
                  <Link href="/userprofile">
                    Edit Profile
                  </Link>
                </button>
              </div>
            </div>
            
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-2xl shadow-lg text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold">{joinedThreadsLength}</h3>
              <p className="mt-2 text-sm md:text-base">Threads Joined</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-lg text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold">{createdThreadsLength}</h3>
              <p className="mt-2 text-sm md:text-base">Contributions</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-2xl shadow-lg text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold">{joinedRoomsLength}</h3>
              <p className="mt-2 text-sm md:text-base">Joined Rooms</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md">
              {recentThreads.length > 0 ? (
                <ul className="space-y-3">
                  {recentThreads.map((recentthread, index) => (
                    <li
                      key={index}
                      className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition duration-200"
                    >
                      <span className="inline-block bg-blue-500 text-white text-xs font-semibold uppercase px-2 py-1 rounded-lg mr-3">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 text-sm md:text-base">
                        <span className="font-medium text-gray-900">You</span> have created a thread in
                        <Link href={`/rooms/${recentthread.room.name}`}>
                          <span className="font-semibold text-blue-600"> {recentthread.room.name}</span>.
                        </Link>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm md:text-base">No recent activity.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
