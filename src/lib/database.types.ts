export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; phone: string; avatar_url: string; role: 'user' | 'admin'; created_at: string; updated_at: string; };
        Insert: { id: string; full_name?: string; phone?: string; avatar_url?: string; role?: 'user' | 'admin'; };
        Update: { full_name?: string; phone?: string; avatar_url?: string; role?: 'user' | 'admin'; };
      };
      destinations: {
        Row: { id: string; name: string; country: string; city: string; description: string; image_url: string; rating: number; price_per_day: number; category: string; is_featured: boolean; created_at: string; };
        Insert: Omit<Database['public']['Tables']['destinations']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['destinations']['Row'], 'id' | 'created_at'>>;
      };
      hotels: {
        Row: { id: string; destination_id: string | null; name: string; address: string; description: string; image_url: string; rating: number; price_per_night: number; amenities: string[]; star_rating: number; is_available: boolean; created_at: string; };
        Insert: Omit<Database['public']['Tables']['hotels']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['hotels']['Row'], 'id' | 'created_at'>>;
      };
      tour_packages: {
        Row: { id: string; destination_id: string | null; name: string; description: string; image_url: string; price: number; duration_days: number; max_people: number; includes: string[]; is_featured: boolean; is_active: boolean; created_at: string; };
        Insert: Omit<Database['public']['Tables']['tour_packages']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['tour_packages']['Row'], 'id' | 'created_at'>>;
      };
      bookings: {
        Row: { id: string; user_id: string; booking_type: 'hotel' | 'package'; destination_id: string | null; hotel_id: string | null; package_id: string | null; check_in: string; check_out: string; guests: number; total_price: number; status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; special_requests: string; created_at: string; updated_at: string; };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'user_id'>>;
      };
      reviews: {
        Row: { id: string; user_id: string; destination_id: string | null; hotel_id: string | null; package_id: string | null; rating: number; title: string; body: string; created_at: string; };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Pick<Database['public']['Tables']['reviews']['Row'], 'rating' | 'title' | 'body'>>;
      };
      wishlists: {
        Row: { id: string; user_id: string; item_type: 'destination' | 'hotel' | 'package'; item_id: string; created_at: string; };
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'>>;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Destination = Database['public']['Tables']['destinations']['Row'];
export type Hotel = Database['public']['Tables']['hotels']['Row'];
export type TourPackage = Database['public']['Tables']['tour_packages']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];
