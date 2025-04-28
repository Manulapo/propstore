import Footer from "@/components/footer";
import AppHeader from "@/components/shared/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex-1 wrapper mt-20">{children}</main>
      <Footer />
    </div>
  );
}
