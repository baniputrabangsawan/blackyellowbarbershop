CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_description text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO site_settings (hero_title, hero_subtitle, hero_description)
VALUES (
  'Potongan Presisi.',
  'Gaya Tanpa Kompromi.',
  'Lebih dari sekadar pangkas rambut. Kami menghadirkan pengalaman premium dengan barber profesional untuk tampilan terbaik Anda.'
);

-- Add RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Enable update for authenticated users only"
  ON site_settings FOR UPDATE
  USING (auth.role() = 'authenticated');
