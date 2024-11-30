import { NextResponse } from 'next/server';
import getsession from './helpers/getsession';  // Assuming getsession is in the helpers folder

export async function middleware(request) {
    // Get the session object (sessionid and isAdmin)
    const { sessionid, isAdmin } = await getsession();
    
    console.log('Session ID:', sessionid);  // Debug log to check session id
    console.log('isAdmin:', isAdmin);       // Debug log to check isAdmin cookie value

    const path = request.nextUrl.pathname;
    const isPublicPath = path === '/login' || path === '/';
    const isPrivatePath = path === '/userdashboard' || path === '/uploadprofilepicture' || path === '/rooms' || path==='/userprofile';
    const isAdminPrivatePath = path === '/adminpanel';

    // Case 1: Admins trying to access login page should be redirected to the admin panel
    if (isPublicPath && sessionid && isAdmin === 'True') {
        return NextResponse.redirect(new URL('/adminpanel', request.url));
    }
    if (isPrivatePath && sessionid && isAdmin === 'True') {
        return NextResponse.redirect(new URL('/adminpanel', request.url));
    }


    // Case 2: Admin panel should only be accessible to admins
    if (isAdminPrivatePath && sessionid && isAdmin !== 'True') {
        return NextResponse.redirect(new URL('/userdashboard', request.url));
    }

    // Case 3: Redirect logged-in users to /userdashboard if they try to access public pages
    if (isPublicPath && sessionid && isAdmin !== 'True') {
        return NextResponse.redirect(new URL('/userdashboard', request.url));
    }

    // Case 4: Redirect users to login if trying to access private paths without session
    if (isPrivatePath && !sessionid) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Case 5: If user is not logged in and tries to access the admin panel, redirect to login page
    if (isAdminPrivatePath && !sessionid) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Case 6: Redirect logged-in user to /userdashboard if they try to access public paths like login or homepage
    if (isPublicPath && sessionid) {
        return NextResponse.redirect(new URL('/userdashboard', request.url));
    }

    // Continue processing the request if none of the conditions apply
    return NextResponse.next();
}

// Define the paths that this middleware will run on
export const config = {
    matcher: ['/', '/login', '/uploadprofilepicture', '/userdashboard', '/adminpanel', '/rooms','/userprofile'],
};
