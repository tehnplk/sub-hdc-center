export default function RapidLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="w-full px-[15px] py-[15px]">{children}</main>
    </div>
  );
}
