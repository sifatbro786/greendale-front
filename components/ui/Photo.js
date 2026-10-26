import Image from "next/image";

/**
 * next/image wrapper for ImageRef objects ({src, alt, width, height}).
 * Use `fill` inside a positioned, sized parent; otherwise intrinsic size is used.
 */
export default function Photo({ image, fill = false, sizes = "100vw", className = "", priority = false, alt, quality = 85 }) {
    if (!image) return null;
    if (fill) {
        return (
            <Image
                src={image.src}
                alt={alt ?? image.alt}
                fill
                sizes={sizes}
                priority={priority}
                quality={quality}
                className={`object-cover ${className}`}
            />
        );
    }
    return (
        <Image
            src={image.src}
            alt={alt ?? image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            priority={priority}
            quality={quality}
            className={className}
        />
    );
}
