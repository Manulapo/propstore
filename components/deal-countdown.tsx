"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { cn, parseDate } from "@/lib/utils";


const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

const DealCountDown = ({
  promoObject,
  orientation = "right",
}: {
  promoObject: Record<string, string>;
  orientation?: "left" | "right";
}) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { title, description, image, targetDate, link } = promoObject || {};
  const countDownDate = parseDate(targetDate);

  useEffect(() => {
    const { days, hours, minutes, seconds } = calculateTimeRemaining(
      new Date(countDownDate)
    );

    const interval = setInterval(
      () => setTime({ days, hours, minutes, seconds }),
      1000
    );

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [time, countDownDate]);

  const promoImage = useMemo(
    () => (
      <div className="flex justify-center my-3">
        <Image
          src={image}
          alt={title}
          width={500}
          height={500}
          className="object-cover"
        />
      </div>
    ),
    [image, title]
  );

  const PromoTextHTML = () => (
    <div className="flex flex-col gap-2 justify-center">
      <h3 className="text-3xl font-bold">{title}</h3>
      <p>{description}</p>
      <ul className="grid grid-cols-4">
        <StatBox label="Days" value={time.days} />
        <StatBox label="Hours" value={time.hours} />
        <StatBox label="Minutes" value={time.minutes} />
        <StatBox label="Seconds" value={time.seconds} />
      </ul>
      <div
        className={cn(
          "w-full flex",
          orientation === "left" ? "justify-start" : "justify-end"
        )}
      >
        <Button asChild>
          <Link href={link ?? "/search"}>View More</Link>
        </Button>
      </div>
    </div>
  );

  if (!countDownDate) {
    console.warn(`Invalid date format for: ${title} \n The date is: ${targetDate}`);
    return null; 
  }

  if (time.days === 0 && time.hours === 0 && time.minutes === 0) {
    return (
      <section className="grid gap-6 grid-cols-2 md:grid-cols-2 my-20">
        <div className="saturate-0 my-2">{promoImage}</div>
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold text-destructive">
            The deal has expired
          </h3>
          <p className="text-mutedforeground">
            The deal has ended, but don&apos;t worry! We have more exciting
            offers coming up soon. Stay tuned for our next big sale and
            exclusive discounts. Thank you for your interest!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-20">
      {orientation === "left" ? (
        <>
          {promoImage} <PromoTextHTML />
        </>
      ) : (
        <>
          <PromoTextHTML /> {promoImage}
        </>
      )}
    </section>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <li className="p-4 text-center w-full">
    <p className="text-3xl font-bold">{value}</p>
    <p>{label}</p>
  </li>
);

export default DealCountDown;
