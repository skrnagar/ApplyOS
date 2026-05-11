import Providers from "../components/Providers";

/** Route layout — document shell lives in `root.tsx` only (no nested html/body). */
export default function RootLayout({ children }) {
  return <Providers>{children}</Providers>;
}
