// Empty in production (same origin as the backend); set to the backend URL in
// dev, where the Next.js server and FastAPI run on different ports.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''
