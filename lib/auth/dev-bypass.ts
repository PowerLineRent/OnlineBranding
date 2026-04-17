export function isDevelopmentAuthBypassEnabled(): boolean {
  // Development convenience:
  // when running `npm run dev` (NODE_ENV=development), bypass auth gates
  // so pages can be iterated without login credentials.
  return process.env.NODE_ENV === 'development';
}
