import Image from "next/image";
import JoinForm from "@/components/join-form";
import ProductDetails from "@/components/product-details";
import QueueExplainer from "@/components/queue-explainer";

export default function Home() {
  const whatsappGroupUrl =
    process.env.WHATSAPP_GROUP_URL ||
    "https://chat.whatsapp.com/E5IELB5rwiJINLg34d01GR";

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-10 sm:py-16">
      {/* Ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-glow-pulse absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute left-0 top-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {/* Hero product image */}
        <div className="animate-fade-up delay-1 mb-8">
          <div className="animate-float-slow relative mx-auto aspect-square max-w-md overflow-hidden rounded-3xl border border-border/80 shadow-[0_0_80px_rgba(59,130,246,0.12)]">
            <Image
              src="/images/hero.jpg"
              alt="Amazfit Helio Strap wearable"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur">
              Official Amazfit
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-fade-up delay-2 mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            Next drop waitlist
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Amazfit Helio Strap
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-muted-foreground">
            Demand is high and stock is limited. Read the details below, then
            join the queue to secure your place.
          </p>
        </div>

        {/* Product details */}
        <div className="animate-fade-up delay-3">
          <ProductDetails />
        </div>

        {/* Queue promise */}
        <section className="animate-fade-up delay-4 mt-4 rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            First come, first served
          </p>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-3">
              <span className="font-mono text-sm font-bold text-accent">01</span>
              <p className="text-sm leading-6 text-muted-foreground">
                Join the queue with your Reddit username and WhatsApp number.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-sm font-bold text-accent">02</span>
              <p className="text-sm leading-6 text-muted-foreground">
                When stock arrives, we message people one by one in the order they
                joined.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-sm font-bold text-accent">03</span>
              <p className="text-sm leading-6 text-muted-foreground">
                If someone doesn&apos;t reply, we move to the next person. Earlier you
                join, earlier your turn.
              </p>
            </li>
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-sm leading-6 text-foreground/80">
            <strong className="font-semibold text-foreground">The rule:</strong>{" "}
            first come, first served. The queue is the order in which you joined.
          </p>

          <QueueExplainer />
        </section>

        {/* Scroll cue to the form */}
        <a
          href="#join-form"
          className="animate-fade-up delay-5 group mx-auto mt-8 flex w-max cursor-pointer flex-col items-center gap-2 text-muted-foreground transition hover:text-accent"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.25em]">
            Join the queue below
          </span>
          <span className="animate-bounce-soft flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-accent shadow-[0_0_24px_rgba(59,130,246,0.10)] transition group-hover:border-accent/50 group-hover:bg-accent/10">
            <ArrowDownIcon />
          </span>
        </a>

        {/* Join form */}
        <div id="join-form" className="animate-fade-up delay-6 mt-6 scroll-mt-6">
          <JoinForm
            queueName="Amazfit Helio Strap"
            whatsappGroupUrl={whatsappGroupUrl}
          />
        </div>

        {/* Product gallery */}
        <section className="animate-fade-up delay-6 mt-10">
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            In action
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                src: "/images/product-1.jpg",
                alt: "Amazfit Helio Strap on a wrist",
              },
              {
                src: "/images/product-2.jpg",
                alt: "Amazfit Helio Strap product close-up",
              },
              {
                src: "/images/product-3.jpg",
                alt: "Amazfit Helio Strap from the side",
              },
            ].map((image) => (
              <div
                key={image.src}
                className="relative h-32 overflow-hidden rounded-2xl border border-border/80 sm:h-40"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 16rem"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          First come, first served · queue order = who joined first
        </p>
      </div>
    </main>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}
