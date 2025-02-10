"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import getcsrftoken from '@/helpers/getcsrftoken'
import Layout from '../components/layout/Layout'
import ThreadCard from '../components/threadcard/Threadcard'

export default function CreatedThreads() {
  const [createdThreads, setcreatedThreads] = useState([])
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [newThreadTitle, setnewThreadTitle] = useState("")
  const [editThreadId, setEditThreadId] = useState(null)


  const getcreatedThreads = async () => {
    const csrftoken = await getcsrftoken()
    const response = await axios.get("http://localhost:8000/api/getCreatedThreads/", {
      headers: {
        "X-CSRFToken": csrftoken.value, // Include the CSRF token in the request headers
      },
      withCredentials: true,
    })
    console.log(response.data.data)
    setcreatedThreads(response.data.data)

  }
  const handleDelete = async (roomname, threadid) => {
    const csrftoken = await getcsrftoken()
    try {
      const response = await axios.get(`http://localhost:8000/api/deletethreads/${roomname}/${threadid}`,
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true
        });
      if (response.data.status == "successful") {
        console.log("Data Deleted")
        // await getcreatedThreads()
        getcreatedThreads()
      }

    } catch (err) {
      console.log(err.message)
    }
  };

  const handleEditAction = (roomname, thread) => {
    setnewThreadTitle(thread.title)
    setIsEditPopupOpen(true)
    setEditThreadId(thread.id)
  }

  const handleEdit = async () => {
    console.log("called")
    const csrftoken = await getcsrftoken()
    try {
      const response = axios.post(`http://localhost:8000/api/editthreads/`,
        {
          title: newThreadTitle,
          id: editThreadId
        }
        ,
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true
        })
      console.log(response.message)
      getcreatedThreads()
      setIsEditPopupOpen(false)
    } catch (err) {
      console.log(err.message)
    }
  }
  useEffect(() => {
    getcreatedThreads()
  }, [])

  return (
    <Layout>
      <div className="container mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-4">Created Threads</h1>
        {createdThreads && createdThreads.length > 0 ? (
          <div className="space-y-4">
            {createdThreads.map((thread) => (
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
                editAction={() => { handleEditAction(thread.room.name, thread) }}
              />
            ))}
          </div>
        ) : (
          <p>No threads created yet.</p>
        )}
        {isEditPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Thread</h2>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 mb-4 focus:outline-none focus:border-purple-500"
                placeholder="Thread title"
                value={newThreadTitle}
                onChange={(e) => setnewThreadTitle(e.target.value)}
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => { setIsEditPopupOpen(false) }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}