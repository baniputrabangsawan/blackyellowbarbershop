"use client";

import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navLinks = [
  { name: "Beranda", href: "/#hero" },
  { name: "Services", href: "/#services" },
  { name: "Live Queue", href: "/#queue" },
  { name: "Barber", href: "/#barber" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Membership", href: "/membership" },
  { name: "Lokasi", href: "/#location" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-6 md:px-12 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold uppercase tracking-tight text-primary">
            Black<span className="text-foreground">Yellow</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link href="/queue" className={cn(buttonVariants({ variant: "default" }), "rounded-full bg-primary text-primary-foreground hover:bg-primary-hover px-6")}>
            Ambil Antrean
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100vh - 5rem)" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 w-full bg-primary shadow-lg md:hidden overflow-hidden"
          >
            <nav className="flex flex-col items-center pt-12 p-6 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-bold text-primary-foreground hover:text-background transition-colors text-center"
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/queue" onClick={() => setIsOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "mt-8 w-3/4 max-w-[250px] rounded-full bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary")}>
                Ambil Antrean
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
