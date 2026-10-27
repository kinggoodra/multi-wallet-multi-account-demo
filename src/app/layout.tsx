import type { ReactNode } from "react";
import Providers from "./providers";
import "./style.css";

export const metadata = {
  title: "Multi-Wallet Multi-Account Demo",
  description: "Multi-wallet EVM account manager",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
