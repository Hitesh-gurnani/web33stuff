import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const LazyImageView: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  className = "",
  priority = false,
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      placeholder="blur"
      blurDataURL={src}
    />
  );
};

export default LazyImageView;
