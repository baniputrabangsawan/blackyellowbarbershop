import { getTestimonials } from "@/actions/admin-testimonial";
import { TestimonialClient } from "./testimonial-client";

export const metadata = {
  title: "Kelola Testimonial - Admin Dashboard",
};

export default async function AdminTestimonialPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Testimonial Pelanggan</h1>
        <p className="text-muted-foreground">Kelola ulasan dan penilaian (rating) yang ditampilkan di halaman publik.</p>
      </div>

      <TestimonialClient initialTestimonials={testimonials} />
    </div>
  );
}
