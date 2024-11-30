import React from "react";
import Link from "next/link";
import { FaUsers, FaUser, FaSignOutAlt, FaClipboardList } from "react-icons/fa";
export default function Navbar({ handlelogout }) {
  return (
    <div className="w-full md:w-64 md:min-w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white p-6 flex flex-col ">
      <Link className="text-center mb-12 flex gap-x-3 items-center" href={"/userdashboard"}>
        <img src="/logo/logo.png" className=" w-14 h-14" alt="" />
        <h1 className="text-xl md:text-2xl font-bold">ChatForum</h1>

      </Link>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              className="flex items-center text-base md:text-lg font-semibold hover:text-indigo-300 transition"
              href={"/userdashboard"}
            >
              <FaUser className="mr-3" /> User Dashboard
            </Link>
          </li>

          <li>
            <Link
              className="flex items-center text-base md:text-lg font-semibold hover:text-indigo-300 transition"
              href={"/rooms"}
            >
              <FaClipboardList className="mr-3" /> Rooms
            </Link>
          </li>
          <li>
            <Link
              className="flex items-center text-base md:text-lg font-semibold hover:text-indigo-300 transition"
              href={"/joinedthreads"}
            >
              <FaUsers className="mr-3" /> Created Threads
            </Link>
          </li>

        </ul>
      </nav>
      <div className="mt-auto">
        <button className="flex items-center text-base md:text-lg font-semibold hover:text-red-300 transition" onClick={handlelogout}>
          <FaSignOutAlt className="mr-3" /> Logout
        </button>
      </div>
    </div>
  );
}
