// import { useContext } from "react";
// import { AuthContext } from "./app/context/authContex";
// import { NextResponse, NextRequest } from "next/server";
// export const config = ["/dashboard/:path*", "/auth-callback"];

// export default function middleware(req: NextRequest) {
//   const user = useContext(AuthContext);
//   if (!user && config.includes(req.nextUrl.pathname)) {
//     const absoluteUrl = new URL("/", req.nextUrl.origin);
//     return NextResponse.redirect(absoluteUrl.toString());
//   }
// }
