"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Button from "../components/button/Button";
import AnimatedText from "../components/animatedtext/Animatedtext";
import getcsrftoken from "@/helpers/getcsrftoken";
import { useRouter } from "next/navigation";

export default function ProfilePictureUpload() {
  const router= useRouter()
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImage(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append("profile_picture", image);
    const csrftoken = await getcsrftoken();
    console.log(csrftoken.value);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/uploadprofilepicture/",
        formData,
        {
          headers: {
            "X-CSRFToken": csrftoken.value, // Include the CSRF token in the request headers
          },
          withCredentials: true,
        }
      );
      console.log(response);
      if(response.data.status=="Successful"){
        router.push('/userdashboard')
      }
      // Handle success (e.g., show a success message, redirect)
    } catch (err) {
      console.error(err);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden py-10">
      {/* Background Oval Design */}
      <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-700 to-blue-700 rounded-full opacity-30 transform rotate-45 z-0"></div>
      <div className="absolute -top-40 -right-20 w-[700px] h-[700px] bg-gradient-to-r from-blue-700 to-purple-700 rounded-full opacity-30 transform rotate-45 z-0"></div>
      <div>
        <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <div className="flex justify-center mb-6">
            <img
              src="/logo/logo.png"
              alt="ChatForum Logo"
              className="w-20 h-20"
            />
          </div>
          <h2 className="text-4xl font-extrabold mb-2 text-center text-purple-700">
            Upload Profile Picture
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Add a personal touch to your ChatForum profile!
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              {previewUrl && (
                <Button
                  title={"Remove Profile Picture"}
                  handleRemove={handleRemove}
                />
              )}
              <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 mt-5">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-purple-700 text-white p-3 rounded-lg shadow-md hover:bg-purple-800 transition-colors duration-300"
            >
              Upload Picture
            </button>
          </form>
          <div className="mt-6 text-center text-gray-600">
            <Link href="/userdashboard" className="text-purple-700 hover:underline">
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
