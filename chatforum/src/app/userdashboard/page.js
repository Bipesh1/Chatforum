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
  const [joinedThreadsLength, setJoinedThreadsLength] = useState(null)
  // const [createdThreads, setCreatedThreads]= useState([])
  const [recentThreads,setRecentThreads]= useState([])
  const [profileUrl, setProfileUrl] = useState("");
  const [profileDetails, setProfileDetails] = useState({});

  useEffect(() => {
    getUserProfile();
    getJoinedThreads();
    

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
                <button className="px-4 py-2 my-2 text-white rounded-lg shadow-md bg-gray-600  hover:bg-gray-700 transition">
                  <Link href="/userprofile">
                    Edit Profile
                  </Link>
                </button>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="px-4 py-2 md:px-6 md:py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition flex items-center justify-between">
                <IoIosNotifications className="text-xl" /> View Latest
                Notifications
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 rounded-2xl shadow-lg text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold">{joinedThreadsLength}</h3>
              <p className="mt-2 text-sm md:text-base">Threads Joined</p>
            </div>
            <div className="bg-gradient-to-r from-gray-800 to-gray-600 p-6 rounded-2xl shadow-lg text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold">{joinedThreadsLength}</h3>
              <p className="mt-2 text-sm md:text-base">Contributions</p>
            </div>
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 rounded-2xl shadow-lg text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold">N/A</h3>
              <p className="mt-2 text-sm md:text-base">Achievements</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md">
              {recentThreads.map((recentthread)=>(
                <p className="text-gray-600 text-sm md:text-base">
                You have created a thread in room {recentthread.room.name}.
              </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
