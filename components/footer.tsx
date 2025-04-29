import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bordet-t">
      <div className="flex items-center justify-center py-4text-white">
        <div className="text-center">
          <h2 className="text-lg font-bold">{APP_NAME}</h2>
          <p className="text-sm">Your one-stop shop for everything!</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-4">
        <Link
          href="/terms-of-use"
          className="text-sm text-muted-foreground hover:underline"
        >
          Privacy Policy
        </Link>
        <span className="mx-2">|</span>
        <Link
          href="/terms-of-use"
          className="text-sm text-muted-foreground hover:underline"
        >
          Terms of Service
        </Link>
        <span className="mx-2">|</span>
        <Link
          href="/terms-of-use"
          className="text-sm text-muted-foreground hover:underline"
        >
          Contact Us
        </Link>
      </div>
      <div className="p-5 flex-center text-xs text-muted-foreground">
        {currentYear} {APP_NAME}&copy; All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
