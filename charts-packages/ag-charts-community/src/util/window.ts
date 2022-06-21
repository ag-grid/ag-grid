/**
 * Redeclaration of window that is safe for use with Gatsby server-side (webpack) compilation.
 */
export const WINDOW: any | undefined = typeof window === "undefined" ? undefined : (window as any);
