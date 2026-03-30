/**
 * Location-based delivery fee table for Nigeria.
 * Rates are in Naira (₦) and reflect typical logistics costs from Lagos.
 *
 * Zone 1 — Lagos:                        ₦1,500
 * Zone 2 — South West (excl. Lagos):     ₦2,500
 * Zone 3 — South East / South South:     ₦3,500
 * Zone 4 — North Central / FCT:          ₦4,000
 * Zone 5 — North West:                   ₦5,000
 * Zone 6 — North East:                   ₦5,500
 */

export const SHIPPING_RATES: Record<string, number> = {
  // Zone 1 — Lagos
  'Lagos': 1500,

  // Zone 2 — South West
  'Ogun': 2500,
  'Oyo': 2500,
  'Osun': 2500,
  'Ondo': 2500,
  'Ekiti': 2500,
  'Edo': 2500,

  // Zone 3 — South East / South South
  'Delta': 3500,
  'Rivers': 3500,
  'Anambra': 3500,
  'Imo': 3500,
  'Abia': 3500,
  'Enugu': 3500,
  'Ebonyi': 3500,
  'Cross River': 3500,
  'Akwa Ibom': 3500,
  'Bayelsa': 3500,

  // Zone 4 — North Central / FCT
  'FCT (Abuja)': 4000,
  'Kwara': 4000,
  'Kogi': 4000,
  'Niger': 4000,
  'Benue': 4000,
  'Nasarawa': 4000,
  'Plateau': 4000,

  // Zone 5 — North West
  'Kano': 5000,
  'Kaduna': 5000,
  'Zamfara': 5000,
  'Sokoto': 5000,
  'Kebbi': 5000,
  'Katsina': 5000,
  'Jigawa': 5000,

  // Zone 6 — North East
  'Borno': 5500,
  'Yobe': 5500,
  'Gombe': 5500,
  'Bauchi': 5500,
  'Adamawa': 5500,
  'Taraba': 5500,
};

/** All 36 states + FCT, sorted alphabetically */
export const NIGERIAN_STATES = Object.keys(SHIPPING_RATES).sort((a, b) =>
  a.localeCompare(b)
);

/**
 * Returns the delivery fee in Naira for a given state name.
 * Falls back to ₦4,500 for any unrecognised value.
 */
export function getShippingFee(state: string): number {
  if (!state) return 0;
  const exact = SHIPPING_RATES[state];
  if (exact !== undefined) return exact;
  // Case-insensitive fallback
  const key = Object.keys(SHIPPING_RATES).find(
    (k) => k.toLowerCase() === state.toLowerCase()
  );
  return key ? SHIPPING_RATES[key] : 4500;
}

/** Human-readable zone label shown to the user */
export function getZoneLabel(state: string): string {
  const fee = getShippingFee(state);
  if (fee <= 1500) return 'Lagos';
  if (fee <= 2500) return 'South West';
  if (fee <= 3500) return 'South East / South South';
  if (fee <= 4000) return 'North Central';
  if (fee <= 5000) return 'North West';
  return 'North East';
}
