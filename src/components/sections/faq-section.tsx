"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs = [
  {
    question: "Apakah saya harus mengambil antrean secara online?",
    answer: "Tidak wajib. Anda tetap bisa datang langsung (walk-in) dan mengambil antrean di kasir kami. Namun, mengambil antrean online akan menghemat waktu Anda karena Anda bisa memantau nomor antrean dari mana saja."
  },
  {
    question: "Berapa lama nomor antrean saya berlaku?",
    answer: "Nomor antrean hanya berlaku pada hari yang sama. Jika nomor Anda terlewat lebih dari 3 nomor karena tidak hadir saat dipanggil, status antrean Anda bisa diubah menjadi 'Tidak Hadir' oleh admin kami."
  },
  {
    question: "Apakah saya bisa memilih barber tertentu?",
    answer: "Ya! Saat mengambil antrean (baik online maupun di tempat), Anda dapat memilih barber preferensi Anda. Jika barber tersebut sedang melayani pelanggan lain, Anda mungkin perlu menunggu sedikit lebih lama."
  },
  {
    question: "Bagaimana cara menjadi member Black Yellow?",
    answer: "Anda dapat mendaftar melalui website kami atau menanyakannya langsung di kasir. Pendaftaran melalui website akan diverifikasi terlebih dahulu oleh tim kami sebelum aktif."
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer: "Saat ini kami menerima pembayaran tunai (cash), QRIS, dan transfer bank langsung di kasir. Pembayaran melalui website belum tersedia untuk saat ini."
  }
];

export function FaqSection() {
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
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left font-heading text-lg font-medium hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
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
