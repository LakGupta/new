import IntroController from "@/components/intro-controller";

// Runs during HTML parsing, before the overlay below is painted: a repeat
// visit in this session, or reduced motion, hides the overlay without a flash.
// It also opts the page into scroll reveals (never under reduced motion).
const BOOT_SCRIPT = `(function(){var d=document.documentElement,s=false,r=false;try{s=!!sessionStorage.getItem("helios:intro")}catch(e){}try{r=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}if(s||r)d.setAttribute("data-intro","skip");if(!r)d.setAttribute("data-reveal","")})();`;

// No-JS visitors: no overlay, and nothing left waiting for helios:loaded.
const NOSCRIPT_STYLE =
  "<style>.intro{display:none!important}.hero-in,.reveal{opacity:1!important;transform:none!important}.charge-ring{stroke-dashoffset:0!important}</style>";

/**
 * Full-screen "powering on" overlay for the landing page. The markup and the
 * whole fill/exit timeline are server-rendered CSS, so it plays before React
 * hydrates; IntroController adds the % readout, scroll lock and the
 * helios:loaded event.
 */
export default function IntroLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_STYLE }} />
      <div id="intro" className="intro" aria-hidden="true">
        <div className="flex flex-col items-center px-4">
          <p className="font-display text-5xl font-bold tracking-[-0.04em] text-foreground sm:text-6xl">
            HELIO
          </p>

          <div className="intro-bar mt-8 flex items-center">
            <div className="flex h-11 w-60 gap-1 rounded-[8px] border border-line p-1.5 sm:w-72">
              {Array.from({ length: 10 }, (_, index) => (
                <span key={index} className="intro-seg h-full flex-1 rounded-[2px]" />
              ))}
            </div>
            <span className="ml-1 h-4 w-1.5 rounded-r-[2px] bg-line" />
          </div>

          <p className="mt-5 font-mono text-sm tabular-nums text-charge">
            <span id="intro-pct">0</span>%
          </p>
          <p id="intro-caption" className="label-mono mt-1 h-4">
            pairing…
          </p>
        </div>
      </div>
      <IntroController />
    </>
  );
}
