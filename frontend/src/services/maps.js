// Simple Google Distance Matrix helper using fetch
// Requires: VITE_GOOGLE_MAPS_API_KEY in your environment

const GOOGLE_MAPS_BASE = 'https://maps.googleapis.com/maps/api/distancematrix/json';

function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => usp.append(k, v));
  return usp.toString();
}

export async function getDistanceMatrix({ origins, destinations, units = 'metric' }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('Missing VITE_GOOGLE_MAPS_API_KEY');
  }

  const url = `${GOOGLE_MAPS_BASE}?${buildQuery({
    origins,
    destinations,
    units,
    key,
  })}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Distance Matrix failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data;
}

export function isInRiyadh(addressText) {
  if (!addressText) return false;
  const t = addressText.toLowerCase();
  return t.includes('riyadh') || t.includes('الرياض');
}


