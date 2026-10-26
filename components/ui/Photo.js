import Image from "next/image";

/**
 * With object-cover, a wide photo in a tall box is drawn wider than the box itself.
 * `sizes` describes the box width, so scale it by how much wider the drawn image is,
 * otherwise the browser downloads a too-small file and upscales it (blurry).
 * @param {string} sizes  e.g. "(min-width:1024px) 520px, 100vw"
 * @param {number} factor >= 1
 */
function scaleSizes(sizes, factor) {
    if (!factor || factor <= 1.05) return sizes;
    return sizes
        .split(",")
        .map((part) => {
            const m = part.trim().match(/^(.*?)(\d+(?:\.\d+)?)(px|vw)$/);
            if (!m) return part;
            const v = Math.ceil(Number(m[2]) * factor);
            return `${m[1]}${m[3] === "vw" ? Math.min(v, 300) : v}${m[3]}`;
        })
        .join(",");
}

/**
 * next/image wrapper for ImageRef objects ({src, alt, width, height}).
 * Use `fill` inside a positioned, sized parent; otherwise intrinsic size is used.
 * `ratio` = the box's width / height (e.g. 4/5) so `sizes` is corrected for object-cover cropping.
 */
export default function Photo({ image, fill = false, sizes = "100vw", className = "", priority = false, alt, quality = 85, ratio }) {
    if (!image) return null;
    if (fill) {
        const factor = ratio && image.width && image.height ? image.width / image.height / ratio : 1;
        sizes = scaleSizes(sizes, factor);
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
