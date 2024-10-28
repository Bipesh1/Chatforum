"use client"
import React from 'react';
import { useRouter,usePathname } from 'next/navigation';

export default function ThreadCard({id,title, description,roomname,basepath,created_by,editOption,deleteOption,deleteAction}) {
  const router= useRouter()

  const joinChat=()=>{
    router.push(`${basepath}/${roomname}/${id}?roomname=${roomname}`);
  }
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-4">
        {/* Decorative Icon or Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
            Q
          </div>
        </div>

        {/* Thread Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm capitalize text-gray-600 mt-1">Created By: {created_by}</p>
        </div>

        {/* Action Button */}
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
          {editOption}
        </button>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition" onClick={()=>{deleteAction(roomname,id)}}>
          {deleteOption}
        </button>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition" onClick={joinChat}>
          Join Chat
        </button>
      </div>
    </div>
  );
}

