import Image, { type ImageProps } from "next/image";

type LazyImageProps = Omit<ImageProps, "loading" | "priority">;

/**
 * Optimized image that is only requested when it approaches the viewport.
 * Keep above-the-fold/LCP images on `next/image` with `priority` instead.
 */
const LazyImage = ({ alt, ...props }: LazyImageProps) => (
  <Image {...props} alt={alt} loading="lazy" />
);

export default LazyImage;
