import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "./lib/utils";
import Navbar from "./components/Navbar";
import Providers from "./components/Providers/Providers";
import { AuthProvider } from "./context/authContex";

import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import { Toaster } from "./components/ui/toaster";
import { constructMetadata } from "@/app/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <AuthProvider>
        <Providers>
          <body
            className={cn(
              "min-h-screen font-sans antialiased grainy",
              inter.className
            )}
          >
            <Toaster />
            <Navbar />
            {children}
          </body>
        </Providers>
      </AuthProvider>
    </html>
  );
}
