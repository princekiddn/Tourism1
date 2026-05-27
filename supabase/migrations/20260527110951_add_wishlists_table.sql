/*
  # Add wishlists table for user favorites

  1. New Tables
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `item_type` (text: 'destination', 'hotel', or 'package')
      - `item_id` (uuid, polymorphic reference to destination/hotel/package)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `wishlists` table
    - Users can view/manage their own wishlist items only
    - Unique constraint prevents duplicate wishlist entries

  3. Indexes
    - Index on user_id for fast user wishlist lookups
    - Unique index on (user_id, item_type, item_id) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('destination', 'hotel', 'package')),
  item_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wishlists_unique_entry
  ON wishlists (user_id, item_type, item_id);

CREATE INDEX IF NOT EXISTS wishlists_user_id_idx
  ON wishlists (user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
