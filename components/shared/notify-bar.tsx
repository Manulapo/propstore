"use client";

import { ShoppingCartIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NotifyBar = () => {
  const [isClosed, setIsClosed] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsClosed(false);
    }, 1000);
  }, []);

  return (
    <>
      {!isClosed && (
        <div
          className="w-90% mx-auto bg-main rounded-full text-secondary py-2 relative"
          role="alert"
        >
          <Link
            href="/terms-of-use"
            className="flex items-center justify-center text-center text-sm font-semibold text-secondary"
          >
            <div className="flex justify-center items-center w-full px-4 ">
              <ShoppingCartIcon className="text-secondary mr-3" size={20} />
              <p>Is this Webiste Real?</p>
            </div>
          </Link>
          <X
            className="text-secondary absolute right-4 top-3"
            size={16}
            onClick={() => setIsClosed(true)}
          />
        </div>
      )}
    </>
  );
};

export default NotifyBar;
