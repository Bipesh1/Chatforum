"use client";
import getcsrftoken from "@/helpers/getcsrftoken";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

import { CiSquareChevUp, CiSquareChevDown, CiEdit, CiImageOn } from "react-icons/ci";
import { CgClose } from "react-icons/cg";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function ChatRoom({ params }) {
  const searchParams = useSearchParams();
  const roomname = searchParams.get("roomname");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [istypingmessage, setIsTypingMessage] = useState(null);
  const userref = useRef(null);
  const socketRef = useRef(null);
  const threadId = params.id;
  const typingTimeOut = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [images, setNewImages] = useState([]);
  const [previewUrls, setNewPreviewUrls] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null); // State to track which message is being edited
  const [editedContent, setEditedContent] = useState("");
  const [hasNext,setHasNext]= useState("")
  const [currentPageNumber,setCurrentPageNumber]=useState(1)

  const handleImageChange = (e) => {
    let files = Array.from(e.target.files); // Get the list of files
    let urlObjects = []; // For storing the preview URLs
    let base64Images = []; // For storing Base64-encoded images
   

    files.forEach((image, index) => {
      // Create preview URLs for displaying
      urlObjects[index] = URL.createObjectURL(image);

      // Convert each image to Base64 using FileReader
      const reader = new FileReader();
      reader.readAsDataURL(image); // Read image as Data URL (Base64)
      reader.onload = () => {
        base64Images.push(reader.result); // Add the Base64 string to the array

        // Check if all images are converted before updating the state
        if (base64Images.length === files.length) {
          setNewImages(base64Images); // Set Base64-encoded images
        }
      };
    });

    setNewPreviewUrls(urlObjects); // Set preview URLs for displaying images
  };

  const handleRemoveImage = (index) => {
    // Remove the image from preview URLs
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    // Remove the corresponding Base64-encoded image
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (messageid, content) => {
    setEditingId(messageid);
    setEditedContent(content);
  };


  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      const message = { typing: true, sender: userref.current.username };
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(JSON.stringify(message));
      }
    }
    clearTimeout(typingTimeOut.current);

    typingTimeOut.current = setTimeout(() => {
      setIsTyping(false);
      const message = { typing: false, sender: "none" };
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(JSON.stringify(message));
      }
    }, 2000);
  };
  const getMessages = async () => {
    const csrftoken = await getcsrftoken()
    const messagesResponse = await axios.get(
      `http://localhost:8000/api/getMessages/${threadId}/?page=${currentPageNumber}`,
      {
        headers: { "X-CSRFToken": csrftoken.value },
        withCredentials: true,
      }
    );
    console.log(messagesResponse.data);
    setCurrentPageNumber((prev)=>prev+1)
    
    setHasNext(messagesResponse.data.has_next)
    if (
      Array.isArray(messagesResponse.data.message) &&
      messagesResponse.data.message.length !== 0
    ) {
      messagesResponse.data.message.forEach((message) => {
        message.isUser = message.user.username === userref.current.username;
      });
      const reversedMessages = [...messagesResponse.data.message].reverse();
      setMessages((prevMessages) => {
        const newMessages = reversedMessages.filter(
          (newMessage) =>
            !prevMessages.some(
              (prevMessage) => prevMessage.id === newMessage.id
            )
        );
        return [...newMessages, ...prevMessages];
      });
    }

  }
  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId); // Set the message to be edited
    setEditedContent(currentContent); // Pre-fill the text area with the current content
  };
  const handleCancelEdit = () => {
    setEditingMessageId(null);  // Exit editing mode
    setEditedContent("");  // Reset the content
  };

  useEffect(() => {
    async function fetchData() {
      const csrftoken = await getcsrftoken();
      const userProfile = await axios.get(
        "http://localhost:8000/api/getprofiledata/",
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true,
        }
      );
      userref.current = userProfile.data.user;
      console.log("User profile fetched");

      getMessages()
      if (!socketRef.current) {
        console.log(`Setting up WebSocket for threadId: ${threadId}`);
        socketRef.current = new WebSocket(
          `ws://localhost:8000/ws/chat/${threadId}/`
        );
        socketRef.current.onopen = () =>
          console.log(
            `WebSocket connection established for threadId: ${threadId}`
          );

        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(
            `Typing notification received: ${data.whoIsTyping} is typing in room`
          );
          if (data.whoIsTyping) {
            setIsTypingMessage(
              data.whoIsTyping !== "none"
                ? `${data.whoIsTyping} is typing...`
                : null
            );
          }
          if (data.action) {
            console.log(data.action);
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === data.message_id ? { ...msg, content: data.content } : msg
              )
            );
          }
          else if ((data.content && data.content.trim() !== "") || (data.images && data.images.length > 0)) {
            const message = {
              id: data.message_id,
              sender: data.sender,
              content: data.content || "",  // If content is not present, fallback to an empty string
              image: data.images || [],
              date_added: data.date_added,    // Ensure images is always an array
              isUser: data.sender === userref.current.username,
            };

            console.log("Message object constructed:", message);  // Add this log
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, message];
              console.log("Updating state with messages:", updatedMessages);  // Debugging to check if state updates
              return updatedMessages;
            });
          } else {
            console.log("Message not valid for update");
          }
        };

        console.log("WebSocket setup complete");
      }
    }

    fetchData();
    return () => {
      if (socketRef.current) {
        console.log("Closing WebSocket connection");
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [threadId]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" || images.length > 0) {
      let message = {
        sender: userref.current.username,
        roomname: roomname,
        type: "", // Use clear 'type' to indicate message content type
      };

      if (newMessage.trim() !== "") {
        // Only text is being sent
        message.content = newMessage;
        message.type = "newtext";
      } else if (images.length > 0) {
        // Only images are being sent
        message.images = images;
        message.type = "images";
      }

      // Send the message via WebSocket
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log(message);
        socketRef.current.send(JSON.stringify(message));
      }

      // Clear the message input and images after sending
      setNewMessage("");
      setNewImages([]);
      setNewPreviewUrls([]);
    }
  };
  const handleUpvote = async (messageid) => {
    const csrftoken = await getcsrftoken()
    const response = await axios.get(`http://localhost:8000/api/handleUpVote/${messageid}/`,
      {
        headers: { "X-CSRFToken": csrftoken.value },
        withCredentials: true,
      }
    )
    console.log(response.data)
    if (response.data.status == "successful") {
      getMessages()
    }

    else if (response.data.status == "error") {
      toast.error("You already upvoted this message", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
    }

  }
  const handleDownvote = async (messageid) => {
    const csrftoken = await getcsrftoken()
    const response = await axios.get(`http://localhost:8000/api/handleDownVote/${messageid}/`,
      {
        headers: { "X-CSRFToken": csrftoken.value },
        withCredentials: true,
      }
    )
    console.log(response.data)
    if (response.data.status == "successful") {
      getMessages()
    }

    else if (response.data.status == "error") {
      toast.error("You already downvoted this message", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
    }

  }
  const handleSaveEdit = (messageID) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      const message = { type: "edited", messageID: messageID, editedContent: editedContent, sender: userref.current.username, roomname: roomname };
      console.log(message)
      socketRef.current.send(JSON.stringify(message));
    }
    setEditingMessageId(null);
    setEditedContent('');
    getMessages();
  }

  const formatDate = (dateAdded) => {
    try {
      const date = new Date(dateAdded);  // Use the passed date string directly
      const today = new Date();

      const isToday =
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate();

      if (isToday) {
        // Show only time if the message is today
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        // Show date and time if it's not today
        return date.toLocaleString();
      }
    } catch (err) {
      console.log(err); // Log the error if it occurs
      return new Date(dateAdded).toLocaleString(); // Fallback to default format
    }
  }



  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div>

      </div>
      {/* Chat Header */}
      <div className="bg-white p-6 shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold">{roomname}</h2>
        <Link href={`/upvote/${params.id}`} className="border border-gray-700 px-5 py-2 rounded-md uppercase text-gray-800 font-semibold ">See the most upvoted messages</Link>

        {/* Right-aligned buttons */}
        <div className="flex space-x-4">

          {/* Back to Threadroom */}
          {hasNext &&
          <button className="text-gray-800 hover:text-gray-700 font-semibold border border-gray-600 px-4 py-2 rounded" onClick={getMessages}>
           See more messages
          </button>
          }
          {/* Back to Threadroom */}
          <Link href={`/rooms/${roomname}`} className="text-gray-600 hover:text-gray-700 font-semibold border border-gray-600 px-4 py-2 rounded">
            Back to Threadroom
          </Link>
          {/* Leave Chat */}
          <button className="text-red-600 hover:text-red-700 font-semibold border border-red-600 px-4 py-2 rounded">
            Leave Chat
          </button>
        </div>
      </div>

      {/* Chat Messages (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 mb-20">
        {" "}
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex mb-4 ${message.isUser ? "justify-end" : "justify-start"
              }`}
          >
            {/* Separate rendering for text and images */}
            {message.content && (
              <div className="flex items-center space-x-4">
                {/* Upvote Section */}
                <div className="flex flex-col items-center space-y-2 bg-gray-50 py-1 px-1 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col justify-center items-center">
                    {message.upvote}
                    <CiSquareChevUp
                      className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:scale-110"
                      onClick={() => handleUpvote(message.id)}
                    />
                    <CiSquareChevDown
                      className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer transition-transform transform hover:scale-110"
                      onClick={() => handleDownvote(message.id)}
                    />
                    {message.downvote}
                  </div>
                </div>

                {/* Conditional Rendering: Either message content or the edit input */}
                {editingMessageId === message.id ? (
                  // When in edit mode, show the textarea for editing
                  <div className="mt-4 w-full">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="p-2 w-full rounded-md border border-gray-300"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => { handleSaveEdit(message.id) }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Save Edit
                      </button>
                      <button
                        onClick={() => handleCancelEdit()}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // When not in edit mode, show the message content
                  <div
                    className={`p-6 rounded-lg max-w-2xl break-words shadow-xl transition-transform duration-300 ${message.isUser ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    <p className="font-semibold text-sm ">{message.sender ? message.sender : message.user.username}</p>
                    <div className="relative group inline-block">
                      <p className="text-lg">
                        {message.content}
                      </p>
                      {/* Tooltip */}
                      <div className="absolute left-10 top-3/4 transform translate-y-1 mt-1 mb-2 hidden group-hover:block bg-gray-400 text-gray-950 text-sm rounded px-2 py-1 shadow-md whitespace-nowrap">
                        {formatDate(message.date_added)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit button */}
                {message.isUser && (
                  <CiEdit
                    className="text-xl text-blue-500 cursor-pointer ml-2"
                    onClick={() => handleEditMessage(message.id, message.content)}
                  />)
                }
              </div>
            )}

            {/* Image Section */}
            {message.image && (
              <div className="flex gap-2 mt-2">
                {(Array.isArray(message.image) ? message.image : [message.image]).map(
                  (imageUrl, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={imageUrl} // Use dynamic image URL
                      alt={`Image sent by ${message.sender}`}
                      className="w-full max-w-xl h-auto object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                    />
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Typing Notification (Fixed above the input field) */}
      {istypingmessage && (
        <div className="fixed bottom-20 left-4 text-sm italic text-gray-600">
          {istypingmessage}
        </div>
      )}

      {/* Input Field (Fixed at the bottom) */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md flex items-center">
        <div className="w-full">
          <div className="flex gap-x-5">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                {/* Image */}
                <img src={url} alt="Preview" width={100} height={100} className="rounded-md shadow-sm" />
                {/* Cross Icon */}
                <CgClose className="absolute -top-2 -right-2 rounded-full h-5 w-5 bg-red-500 text-white text-sm  hover:bg-red-600 transition shadow-md" onClick={() => handleRemoveImage(index)} />

              </div>
            ))}
          </div>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            rows={1}
            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none"
          />
        </div>

        <div className="px-2">
          <input
            type="file"
            id="imageupload"
            onChange={handleImageChange}
            hidden
            multiple
          />
          <CiImageOn
            className=" cursor-pointer text-4xl"
            onClick={() => {
              document.getElementById("imageupload").click();
            }}
          />
        </div>
        <button
          onClick={handleSendMessage}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
