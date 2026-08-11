export interface SiteSettings {
  id: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  is_open?: boolean;
  operational_status?: string;
  accept_new_queue?: boolean;
  allow_online_queue?: boolean;
  allow_walkin?: boolean;
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  maps_url?: string;
  business_name?: string;
  email?: string;
  timezone?: string;
  branch_name?: string;
  max_daily_queue?: number;
  max_waiting?: number;
  start_queue_number?: number;
  default_estimation_mins?: number;
  late_tolerance_mins?: number;
  allow_barber_selection?: boolean;
  membership_registration_active?: boolean;
  auto_activate_membership?: boolean;
  default_membership_days?: number;
  birthday_promo_active?: boolean;
  logo_url?: string;
  favicon_url?: string;
  brand_tagline?: string;
  og_image_url?: string;
  seo_title?: string;
  meta_description?: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title?: string;
  alt_text: string;
  category: string;
  is_published: boolean;
  sort_order: number;
}

export interface Barber {
  id: string;
  name: string;
  slug?: string;
  bio?: string;
  photo_url?: string;
  specialties?: string[];
  is_active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  start_date?: string | null;
  end_date?: string | null;
  cta_text?: string;
  cta_url?: string;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  is_active?: boolean;
}

export interface Queue {
  id: string;
  branch_id: string;
  queue_date: string;
  queue_number: number;
  customer_name: string;
  phone: string;
  service_id: string;
  preferred_barber_id?: string | null;
  assigned_barber_id?: string | null;
  status: string;
  source: string;
  joined_at: string;
  called_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  branches?: Partial<Branch>;
  services?: Partial<Service>;
  barbers?: Partial<Barber>;
}
