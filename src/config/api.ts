/**
 * Lumora Haute Couture - API Configuration Helper
 * 
 * In production:
 * - Unified / Same-Domain / Vercel with rewrites:
 *   Leave VITE_API_URL unset or empty. All API requests use relative paths like '/api/...'.
 * - Split Frontend & Backend (e.g. Frontend on Vercel, Backend on Render/Railway):
 *   Set VITE_API_URL="https://your-backend-api.onrender.com" in your environment variables.
 */

export const API_BASE_URL: string = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || ''
).replace(/\/$/, '');

export function getApiUrl(endpoint: string): string {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
