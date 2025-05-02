export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </div>
    </div>
  );
}