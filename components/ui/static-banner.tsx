import LazyImage from "@/components/shared/lazy-image";
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
        <LazyImage
          src={bannerImage}
          alt="Static Banner"
          className="w-full h-auto object-cover rounded-lg"
          width={1000}
          height={500}
        />
      </Link>
    </>
  );
};

export default StaticBanner;
