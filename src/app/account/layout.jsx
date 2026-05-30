import AccountClientGate from "@/components/auth/AccountClientGate";

export default function AccountLayout({ children }) {
  return <AccountClientGate>{children}</AccountClientGate>;
}
