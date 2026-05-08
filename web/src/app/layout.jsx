import Providers from "../components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-white antialiased overflow-x-hidden selection:bg-green-500/30 selection:text-green-400">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
