import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THRIFTR | The Virtual Thrift Mall",
  description: "Premium virtual thrift marketplace in Nairobi, Kenya. Badilisha. Nunua. Starehe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-soft-black text-off-white font-display">
        {children}
      </body>
    </html>
  );
}
