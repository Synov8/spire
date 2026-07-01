/**
 * HomeFaq — inline micro-FAQ accordion on the homepage.
 *
 * Per home-overhaul-spec.md §4.8 + §10.6:
 *   • 5 questions selected from the canonical FAQS constant.
 *   • Copy matches `app/routes/faq.tsx` source (drift impossible — both
 *     import the same `~/lib/faq-data` module).
 *   • "See all FAQs → /faq" anchor resolves to the dedicated FAQ page.
 *
 * Motion pattern:
 *   • `<AnimatePresence initial={false}>` ensures no enter animation on
 *     mount — initial SSR HTML ships with no answer body inline. No
 *     hydration mismatch risk.
 *   • `height: "auto"` + `opacity` tween for a smooth open/close.
 *   • `useReducedMotion()` snaps to `duration: 0` when the user prefers
 *     reduced motion.
 *   • Overflow-hidden on the motion div is critical — without it the
 *     answer text bleeds during the height collapse.
 *
 * Accessibility:
 *   • Each button gets `aria-expanded` + `aria-controls` pointing to the
 *     panel's `id`. `<button onClick>` natively handles keyboard (Enter
 *     / Space) activation. Chevron rotation is plain CSS transform — no
 *     motion opacity animation needed.
 *   • Focus-visible outline matches the brand accent so keyboard users
 *     can see which question is focused.
 */

import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { FAQS } from "~/lib/faq-data";

// The 5 questions to surface inline on the home page, in the order the
// spec requested (see §4.8 + §10.6). Answers are looked up from FAQS by
// exact question string so the home copy can never deviate from /faq.
const HOME_FAQ_QUESTIONS = [
  "What is Spire?",
  "Do I still need a compliance consultant?",
  "What access do you need to my systems?",
  "How accurate is the questionnaire autofill?",
  "How long does setup take?",
] as const;

// Module-scoped lookup so we don't rebuild the Map on every render.
// FAQS is a ReadonlyArray constant, so the Map is safe to share.
const faqByQuestion = new Map(FAQS.map((f) => [f.q, f]));

export function HomeFaq() {
  const reducedMotion = useReducedMotion(); // null on SSR, true/false client-side
  const snap = reducedMotion === true;
  const [open, setOpen] = useState<number | null>(null);

  // Spec-ordered 5 entries, each looked up from the canonical FAQS source.
  const homeFaqs = HOME_FAQ_QUESTIONS
    .map((q) => faqByQuestion.get(q))
    .filter((f): f is (typeof FAQS)[number] => Boolean(f));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mt-10 space-y-2">
        {homeFaqs.map((faq, i) => {
          const isOpen = open === i;
          const panelId = `home-faq-a-${i}`;
          return (
            <div
              key={faq.q}
              className="rounded-xl border border-[#1C1C24] bg-[#111116]"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between rounded-xl px-6 py-4 text-left transition-colors hover:bg-[#0A0A0C]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D4AA]"
              >
                <span className="pr-4 text-sm font-medium text-[#F1F1F3]">
                  {faq.q}
                </span>
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-[#5C5C66] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={
                      snap
                        ? { duration: 0 }
                        : { duration: 0.22, ease: "easeOut" }
                    }
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#1C1C24] px-6 py-4">
                      <p className="text-sm leading-relaxed text-[#8B8B93]">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Link
          to="/faq"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#00D4AA] hover:text-[#00B894] transition-colors"
        >
          See all FAQs <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
