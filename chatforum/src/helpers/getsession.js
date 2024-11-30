"use server"

import { cookies } from "next/headers"

export default async function getsession() {
    const cookieStore = cookies();
    const sessionid = cookieStore.get("sessionid")?.value;  // Get the sessionid cookie value
    const isAdmin = cookieStore.get("isAdmin")?.value;      // Get the isAdmin cookie value
    
    // Return an object containing both sessionid and isAdmin
    return { sessionid, isAdmin };
}
