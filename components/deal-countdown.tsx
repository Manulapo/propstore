"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn, parseDate } from "@/lib/utils";

// todo: make a json file with dates, images and text for the promo

const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ), // remainer of what is left from a day and then convert to hours
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)), // remainer of what is left from an hour and then convert to minutes
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000), // remainer of what is left from a minute and then convert to seconds
  };
};

const DealCountDown = ({
  targetDate,
  orientation = "right",
}: {
  targetDate: string;
  orientation?: "left" | "right";
}) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
  }, [countDownDate]);

  const PromoImageHTML = () => (
    <div className="flex justify-center">
      <Image
        src={"/images/promo.jpg"}
        alt="Deal of the Month"
        width={500}
        height={500}
        className="object-cover"
      />
    </div>
  );

  const PromoTextHTML = () => (
    <div className="flex flex-col gap-2 justify-center">
      <h3 className="text-3xl font-bold">Deal of the Month</h3>
      <p>
        Get ready for a shopping experience like never before with our Deals of
        the Month! Every purchase comes with exclusive perks and offers, making
        this month a celebration of savvy choices and amazing deals. Don&apos;t
        miss out!
      </p>
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
          <Link href={"/search"}>View More</Link>
        </Button>
      </div>
    </div>
  );

  if (!countDownDate) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold text-destructive">
            ERROR: Wrong Date schema
          </h3>
          <p className="text-mutedforeground">
            Please provide a valid date in the format DD-MM-YYYY
          </p>
        </div>
      </section>
    );
  }

  if(time.days === 0 && time.hours === 0 && time.minutes === 0) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold text-destructive">
            The deal has expired
          </h3>
          <p className="text-mutedforeground">
            The deal has ended, but don&apos;t worry! We have more exciting offers coming up soon. Stay tuned for our next big sale and exclusive discounts. Thank you for your interest!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 my-20">
      {orientation === "left" ? (
        <>
          <PromoImageHTML /> <PromoTextHTML />
        </>
      ) : (
        <>
          <PromoTextHTML /> <PromoImageHTML />
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
