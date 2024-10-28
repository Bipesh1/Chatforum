"use client";
import getcsrftoken from "@/helpers/getcsrftoken";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { CiImageOn } from "react-icons/ci";

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

      const messagesResponse = await axios.get(
        `http://localhost:8000/api/getMessages/${threadId}/`,
        {
          headers: { "X-CSRFToken": csrftoken.value },
          withCredentials: true,
        }
      );
      console.log(messagesResponse.data);
      if (
        Array.isArray(messagesResponse.data.message) &&
        messagesResponse.data.message.length !== 0
      ) {
        messagesResponse.data.message.forEach((message) => {
          message.isUser = message.user.username === userref.current.username;
        });
        setMessages(messagesResponse.data.message.reverse());
      }

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

          if ((data.content && data.content.trim() !== "") || (data.images && data.images.length > 0)) {
            const message = {
              sender: data.sender,
              content: data.content || "",  // If content is not present, fallback to an empty string
              image: data.images || [],    // Ensure images is always an array
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
        message.type = "text";
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Chat Header */}
      <div className="bg-white p-6 shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold">{roomname}</h2>
        <button className="text-red-600 hover:text-red-700 font-semibold">
          Leave Chat
        </button>
      </div>

      {/* Chat Messages (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 mb-20">
        {" "}
        {/* mb-20 ensures space for the fixed input */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            {/* Separate rendering for text and images */}
            {message.content && (
              <div
                className={`p-4 rounded-lg max-w-2xl break-words shadow-md ${
                  message.isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="font-medium">{message.sender}</p>
                <p>{message.content}</p>
              </div>
            )}

            {message.image && (
              <div className="flex gap-2 mt-2">
                {(Array.isArray(message.image)
                  ? message.image
                  : [message.image]
                ).map((imageUrl, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={imageUrl} // Use dynamic image URL
                    alt={`Image sent by ${message.sender}`}
                    className="w-full max-w-xl h-auto object-cover rounded-lg" // Adjust size to be bigger
                  />
                ))}
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
              <div key={index}>
                <img src={url} alt="Preview" width={100} height={100} />
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
    </div>
  );
}
