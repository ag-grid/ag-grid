// Ambient declarations for test-only polyfills that ship no types.
// Scoped to the test typecheck (tsconfig.spec.json) so they don't leak into the package build.
declare module 'blob-polyfill';
declare module 'text-encoding-polyfill';
