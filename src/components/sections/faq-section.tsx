/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "motion/react";

export function FaqSection({ faqs = [] }: { faqs?: any[] }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section id="faq" className="py-24 bg-surface border-y border-border">
      <div className="container mx-auto max-w-4xl px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
            Tanya <span className="text-primary">Jawab</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Jawaban untuk pertanyaan yang paling sering ditanyakan pelanggan.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id || index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left font-heading text-lg font-medium hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 whitespace-pre-wrap">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
