import { NextResponse } from "next/server";

export async function GET(){
    try{
        const response= NextResponse.json({
            status:'successful',
            message:"Logout Successful",
        })
        response.cookies.set("csrftoken","",{
            httpOnly:true,
            expires: new Date(0)   
        })
        response.cookies.set("sessionid","",{
            httpOnly:true,
            expires: new Date(0)   
        })
        response.cookies.set("isAdmin","",{
            httpOnly:true,
            expires: new Date(0)   
        })
        return response;
    }catch(error){
        return NextResponse.json({error:error.message},{status:500})
    }

}