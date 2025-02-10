'use client';

import { APP_NAME } from "@/lib/constants";
import Image from 'next/image';
import Link from "next/link";
import Menu from "./menu";

export default function Header() {
    return (
        <header className="w-full border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href='/' className="flex items-center">
                        <Image
                            src='/images/logo.svg'
                            height={48}
                            width={48}
                            priority={true}
                            alt={`${APP_NAME} Logo`}
                        />
                    </Link>
                    <h1 className="text-2xl font-bold">{APP_NAME}</h1>
                </div>
                <Menu />
            </div>
        </header>
    );
}