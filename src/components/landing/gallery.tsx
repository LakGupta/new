import Image from "next/image";
import Reveal from "@/components/landing/reveal";

const IMAGES = [
  { src: "/images/product-1.jpg", alt: "Amazfit Helio Strap on a wrist" },
  { src: "/images/product-2.jpg", alt: "Amazfit Helio Strap product close-up" },
  { src: "/images/product-3.jpg", alt: "Amazfit Helio Strap from the side" },
];

export default function Gallery() {
  return (
    <Reveal aria-label="Product photos" className="mx-auto max-w-[1100px] py-16 sm:py-24">
      <p className="label-mono px-4">In the wild</p>
      <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible">
        {IMAGES.map((image) => (
          <div
            key={image.src}
            className="relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-[10px] border border-line md:w-auto"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 78vw, 22rem"
              className="object-cover transition-transform duration-500 ease-out hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    </Reveal>
  );
}
