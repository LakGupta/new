import ProductDetails from "@/components/product-details";
import QueueExplainer from "@/components/queue-explainer";
import Reveal from "@/components/landing/reveal";
import SectionHeading from "@/components/landing/section-heading";
import SegmentBar from "@/components/landing/segment-bar";

const STEPS = [
  "Join the queue with your Reddit username and WhatsApp number.",
  "When stock arrives, we message people one by one in the order they joined.",
  "If someone doesn't reply, we move to the next person. Earlier you join, earlier your turn.",
];

export default function QueueSteps() {
  return (
    <Reveal
      aria-labelledby="how-title"
      className="border-y border-line bg-surface"
    >
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28">
        <SectionHeading id="how-title" eyebrow="How the queue works" title="First come, first served.">
          The queue is the order in which you joined. Nothing else moves you up.
        </SectionHeading>

        <ol className="mt-12 grid gap-0 lg:grid-cols-3 lg:gap-6">
          {STEPS.map((step, index) => (
            <li key={step} className="relative flex gap-5 lg:block">
              {/* Connector: vertical on mobile, horizontal on desktop. */}
              <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-charge font-mono text-sm font-semibold text-charge">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < STEPS.length - 1 ? (
                  <>
                    <SegmentBar
                      filled={10 - index * 4}
                      className="my-2 min-h-24 w-1.5 flex-1 flex-col gap-[3px] lg:hidden"
                      segmentClassName="w-full min-h-1"
                    />
                    <SegmentBar
                      filled={10 - index * 4}
                      className="hidden flex-1 lg:flex"
                      segmentClassName="h-1.5"
                    />
                  </>
                ) : null}
              </div>
              <p className="pt-2 text-base leading-7 text-foreground/85 lg:mt-5 lg:pt-0 lg:pr-4">
                {step}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 lg:mt-14 lg:grid-cols-2">
          <QueueExplainer />
          <ProductDetails />
        </div>
      </div>
    </Reveal>
  );
}
