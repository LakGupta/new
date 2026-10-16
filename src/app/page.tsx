import Link from "next/link";
import IntroLoader from "@/components/intro-loader";
import LandingTabs from "@/components/landing-tabs";
import Faq from "@/components/landing/faq";
import FounderNote from "@/components/landing/founder-note";
import Gallery from "@/components/landing/gallery";
import Hero from "@/components/landing/hero";
import HonestPart from "@/components/landing/honest-part";
import { WhatsAppIcon } from "@/components/landing/icons";
import ProofSection from "@/components/landing/proof-section";
import QueueSteps from "@/components/landing/queue-steps";
import QueueTicket from "@/components/landing/queue-ticket";
import Reveal from "@/components/landing/reveal";
import SectionHeading from "@/components/landing/section-heading";
import SiteFooter from "@/components/landing/site-footer";
import SiteNav from "@/components/landing/site-nav";
import SpecSheet from "@/components/landing/spec-sheet";
import VouchLink from "@/components/landing/vouch-link";

export default function Home() {
  const whatsappGroupUrl =
    process.env.WHATSAPP_GROUP_URL ||
    "https://chat.whatsapp.com/E5IELB5rwiJINLg34d01GR";

  return (
    <>
      <IntroLoader />
      <div className="grain flex flex-1 flex-col overflow-x-clip">
        <SiteNav />
        <main className="flex-1">
          <Hero />
          <ProofSection />
          <FounderNote />
          <SpecSheet />
          <QueueSteps />
          <HonestPart />

          <Reveal
            aria-labelledby="faq-title"
            className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28"
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
              <SectionHeading id="faq-title" eyebrow="Before you ask" title="Questions, answered." />
              <Faq />
            </div>
          </Reveal>

          {/* Join / check-position tabs */}
          <section
            id="join-form"
            aria-labelledby="join-title"
            className="scroll-mt-16 border-y border-line bg-surface"
          >
            <div className="mx-auto max-w-[1100px] px-4 py-16 sm:py-24 lg:py-28">
              <SectionHeading id="join-title" eyebrow="The queue" title="Get on the list.">
                Takes 20 seconds. Your place locks in the moment you submit.
              </SectionHeading>

              <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
                {/* Form first on phones; ticket sits beside it on desktop. */}
                <div className="order-last lg:sticky lg:top-24 lg:order-none">
                  <QueueTicket />
                  <VouchLink className="mt-4" />
                </div>

                <div className="min-w-0">
                  <LandingTabs queueName="Amazfit Helio Strap" />

                  {/* WhatsApp group (separate block, after the form) */}
                  {whatsappGroupUrl ? (
                    <div className="mt-6 rounded-[10px] border border-line bg-background p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-[#25D366]">
                          <WhatsAppIcon className="h-6 w-6" />
                        </span>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Join our WhatsApp group
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Get notified before the queue opens and when new
                            stock arrives.
                          </p>
                        </div>
                      </div>
                      <a
                        href={whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost mt-4 w-full px-4"
                      >
                        Join WhatsApp group
                      </a>
                    </div>
                  ) : null}

                  <Link
                    href="/historical"
                    className="mt-4 flex min-h-11 items-center justify-center text-center text-sm text-muted-foreground transition-colors duration-[120ms] hover:text-charge"
                  >
                    Messaged us before this site? Join the historical queue →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Gallery />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
