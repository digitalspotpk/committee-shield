export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-6 pb-10 pt-12">{children}</div>;
}
