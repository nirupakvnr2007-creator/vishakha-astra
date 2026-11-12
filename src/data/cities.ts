export interface CityLocation {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
}

export const POPULAR_CITIES: CityLocation[] = [
  // India
  { name: 'New Delhi', region: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, utcOffset: 5.5 },
  { name: 'Mumbai', region: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, utcOffset: 5.5 },
  { name: 'Bengaluru', region: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, utcOffset: 5.5 },
  { name: 'Chennai', region: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, utcOffset: 5.5 },
  { name: 'Kolkata', region: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, utcOffset: 5.5 },
  { name: 'Hyderabad', region: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, utcOffset: 5.5 },
  { name: 'Ahmedabad', region: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, utcOffset: 5.5 },
  { name: 'Pune', region: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, utcOffset: 5.5 },
  { name: 'Jaipur', region: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, utcOffset: 5.5 },
  { name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, utcOffset: 5.5 },
  { name: 'Chandigarh', region: 'Punjab/Haryana', country: 'India', latitude: 30.7333, longitude: 76.7794, utcOffset: 5.5 },
  { name: 'Kochi', region: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, utcOffset: 5.5 },
  { name: 'Varanasi', region: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, utcOffset: 5.5 },
  { name: 'Indore', region: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, utcOffset: 5.5 },
  { name: 'Bhubaneswar', region: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, utcOffset: 5.5 },
  { name: 'Guwahati', region: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, utcOffset: 5.5 },
  { name: 'Visakhapatnam', region: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, utcOffset: 5.5 },
  { name: 'Nagpur', region: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, utcOffset: 5.5 },
  { name: 'Coimbatore', region: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, utcOffset: 5.5 },
  { name: 'Patna', region: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, utcOffset: 5.5 },

  // Americas
  { name: 'New York', region: 'NY', country: 'USA', latitude: 40.7128, longitude: -74.0060, utcOffset: -5.0 },
  { name: 'San Francisco', region: 'CA', country: 'USA', latitude: 37.7749, longitude: -122.4194, utcOffset: -8.0 },
  { name: 'Los Angeles', region: 'CA', country: 'USA', latitude: 34.0522, longitude: -118.2437, utcOffset: -8.0 },
  { name: 'Chicago', region: 'IL', country: 'USA', latitude: 41.8781, longitude: -87.6298, utcOffset: -6.0 },
  { name: 'Toronto', region: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, utcOffset: -5.0 },
  { name: 'Vancouver', region: 'BC', country: 'Canada', latitude: 49.2827, longitude: -123.1207, utcOffset: -8.0 },
  { name: 'Dallas', region: 'TX', country: 'USA', latitude: 32.7767, longitude: -96.7970, utcOffset: -6.0 },
  { name: 'Seattle', region: 'WA', country: 'USA', latitude: 47.6062, longitude: -122.3321, utcOffset: -8.0 },

  // Europe & UK
  { name: 'London', region: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, utcOffset: 0.0 },
  { name: 'Paris', region: 'Île-de-France', country: 'France', latitude: 48.8566, longitude: 2.3522, utcOffset: 1.0 },
  { name: 'Berlin', region: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, utcOffset: 1.0 },
  { name: 'Amsterdam', region: 'North Holland', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, utcOffset: 1.0 },
  { name: 'Zurich', region: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417, utcOffset: 1.0 },
  { name: 'Dublin', region: 'Leinster', country: 'Ireland', latitude: 53.3498, longitude: -6.2603, utcOffset: 0.0 },

  // Asia-Pacific & Middle East
  { name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, utcOffset: 4.0 },
  { name: 'Singapore', region: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, utcOffset: 8.0 },
  { name: 'Kuala Lumpur', region: 'FT', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, utcOffset: 8.0 },
  { name: 'Sydney', region: 'NSW', country: 'Australia', latitude: -33.8688, longitude: 151.2093, utcOffset: 10.0 },
  { name: 'Melbourne', region: 'VIC', country: 'Australia', latitude: -37.8136, longitude: 144.9631, utcOffset: 10.0 },
  { name: 'Tokyo', region: 'Kanto', country: 'Japan', latitude: 35.6762, longitude: 139.6503, utcOffset: 9.0 },
  { name: 'Bangkok', region: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018, utcOffset: 7.0 },
];
