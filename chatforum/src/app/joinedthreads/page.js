"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import getcsrftoken from '@/helpers/getcsrftoken'
import Layout from '../components/layout/Layout'
import ThreadCard from '../components/threadcard/Threadcard'

export default function JoinedThreads() {
  const [joinedThreads, setJoinedThreads] = useState([])
  const [roomName, setRoomName]= useState(null)

  const getJoinedThreads = async () => {
    const csrftoken = await getcsrftoken()
    const response = await axios.get("http://localhost:8000/api/getJoinedThreads/", {
      headers: {
        "X-CSRFToken": csrftoken.value, // Include the CSRF token in the request headers
      },
      withCredentials: true,
    })
    console.log(response)
    setJoinedThreads(response.data.data)
    // setRoomName(response.data.data.room.name)
  }
  const handleDelete = async (roomname,threadid) => {
        const csrftoken = await getcsrftoken()
        try {
            const response = await axios.get(`http://localhost:8000/api/deletethreads/${roomname}/${threadid}`,
                {
                    headers: { "X-CSRFToken": csrftoken.value },
                    withCredentials: true
                });
            if (response.data.status == "successful") {
                console.log("Data Deleted")
                await getJoinedThreads()
            }

        } catch (err) {
            console.log(err.message)
        }
    };


  useEffect(() => {
    getJoinedThreads()
  }, [])

  return (
    <Layout>
      <div className="container mx-auto mt-8 px-5">
        <h1 className="text-3xl font-bold mb-4">GoLang Threads</h1>       
        {(joinedThreads && joinedThreads.length > 0) ? (
          <div className="space-y-4">
            {joinedThreads.map((thread) => (
              <ThreadCard
              key={thread.id}
              id={thread.id}
              title={thread.title}
              description={thread.description}
              roomname={thread.room.name}
              created_by={thread.created_by['username']}
              basepath={'/rooms'}
              editOption={'Edit'}
              deleteOption={'Delete'}
              deleteAction={handleDelete}
            />
            ))}
          </div>
        ) : (
          <p>No threads created yet.</p>
        )}
      </div>
    </Layout>
  )
}
