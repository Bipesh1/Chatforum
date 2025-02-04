"use client"
import React, { useState } from 'react'
import Navbar from '../navbar/Navbar'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Discuss } from 'react-loader-spinner'

export default function Layout({ children }) {
    const router = useRouter()
    const [isLoggingOut,setIsLoggingOut]=useState(false)
    const handlelogout = async () => {
        try{
            
            setIsLoggingOut(true)
            const response = await axios.get("/api/logout");
            console.log(response);
            if (response.data.status == "successful") {
                router.push("/");
            }
        }catch(e){
            console.log("Error occured while logging out")
        }
        finally{
            setIsLoggingOut(false)
        }
    };
    return (
        <div className='min-h-screen flex  md:flex-row bg-gray-100'>
            <Navbar handlelogout={handlelogout} />
           {isLoggingOut &&

               <div className='z-10 w-1/2 flex items-center justify-center shadow-lg bg-white p-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <Discuss
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="discuss-loading"
                    wrapperStyle={{}}
                    wrapperClass="discuss-wrapper"
                    color="#fff"
                    backgroundColor="#F4442E"
                    />
                    Logging Out....
                </div>
                }
             
            <main className=" flex-1">{children}</main>
        </div>
    )
}
