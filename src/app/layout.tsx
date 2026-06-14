import React from "react";
import MyApp from "./app";
import NextTopLoader from 'nextjs-toploader';
import "./global.css";
import { CustomizerContextProvider } from "./context/customizerContext";
import { Providers } from "./providers";

export const metadata = {
  title: "MATools — Free Online File & Image Converter Tools",
  description: "Free online tools for converting, compressing and editing images, PDFs and files. No signup required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#5D87FF" />
        <Providers>
          <CustomizerContextProvider>
            <MyApp>{children}</MyApp>
          </CustomizerContextProvider>
        </Providers>
      </body>
    </html>
  );
}
