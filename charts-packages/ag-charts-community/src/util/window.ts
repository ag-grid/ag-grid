export function windowValue(name: string): undefined | any {
    /**
     * Redeclaration of window that is safe for use with Gatsby server-side (webpack) compilation.
     */
    const WINDOW = typeof window === "undefined" ? undefined : (window as any);

    return WINDOW?.[name];
}
