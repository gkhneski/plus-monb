import React from "react";
import "../styles/index.css";
import ClientLayout from "../components/common/ClientLayout";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "Cosmetics Studio - Buchungssystem",
  description: "Professionelles Buchungssystem für Ihr Cosmetics Studio",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen overflow-x-hidden bg-slate-50">
        <ClientLayout>{children}</ClientLayout>

        <script
          type="module"
          async
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcosmetics9345back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.12"
        />
        <script
          type="module"
          defer
          src="https://static.rocket.new/rocket-shot.js?v=0.0.1"
        />
      </body>
    </html>
  );
}
