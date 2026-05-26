import Providers from "../components/Providers";
import { metaForPath } from "@/utils/seo";

export function meta({ location }) {
  return metaForPath(location?.pathname ?? "/");
}

/** Route layout — document shell lives in `root.tsx` only (no nested html/body). */
export default function RootLayout({ children }) {
  return <Providers>{children}</Providers>;
}
