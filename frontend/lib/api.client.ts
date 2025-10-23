// Frontend-only for now. Uncomment when backend is ready.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// export async function postJSON<T>(path: string, body: unknown) {
//   const res = await fetch(\\\\, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     // credentials: 'include', // if you use cookies/session
//     // 'X-CSRF-Token': 'TODO: add when backend provides one'
//     body: JSON.stringify(body),
//   });
//   if (!res.ok) throw new Error(\\ \\);
//   return res.json() as Promise<T>;
// }
