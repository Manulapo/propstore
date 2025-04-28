import Image from "next/image";
import AppLogo from "../app-logo";

export const Hero = async () => {
  return (
    <div className="bg-base-200 my-20 px-2">
      <div className="md:grid grid-cols-12 gap-4 justify-center items-center">
        <div className="md:col-span-8 mb-10 items-center">
          <div className="flex flex-col gap-4 items-start justify-center">
            <div className="flex items-center gap-3">
              <AppLogo />
              <h1 className="h3-bold">PropStore</h1>
            </div>
          </div>
          <p className="md:text-8xl text-4xl font-light text-gray-500 leading-1">
            Your one-stop to revive the
            <span className="text-primary font-semibold"> magic</span> of{" "}
            <span className="font-semibold text-main">cinema</span>
          </p>
        </div>
        <div className="md:col-span-4">
          <Image
            src="/images/hero.png"
            height={400}
            width={400}
            priority={true}
            alt="Hero Image"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;