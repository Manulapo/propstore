import Image from "next/image";
import Link from "next/link";

const StaticBanner = ({
  linkTo,
  bannerImage,
}: {
  linkTo: string;
  bannerImage: string;
}) => {
  return (
    <>
      <Link href={linkTo ?? "/"}>
        <Image
          src={bannerImage}
          alt="Static Banner"
          className="w-full h-auto object-cover rounded-lg"
          objectFit="cover"
          objectPosition="center"
          width={1000}
          height={500}
        />
      </Link>
    </>
  );
};

export default StaticBanner;
