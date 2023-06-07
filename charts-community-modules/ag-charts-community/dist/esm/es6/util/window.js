export function windowValue(name) {
    /**
     * Redeclaration of window that is safe for use with Gatsby server-side (webpack) compilation.
     */
    const WINDOW = typeof window !== 'undefined'
        ? window
        : // typeof global !== 'undefined' ? (global as any) :
            undefined;
    return WINDOW === null || WINDOW === void 0 ? void 0 : WINDOW[name];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvd2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxXQUFXLENBQUMsSUFBWTtJQUNwQzs7T0FFRztJQUNILE1BQU0sTUFBTSxHQUNSLE9BQU8sTUFBTSxLQUFLLFdBQVc7UUFDekIsQ0FBQyxDQUFFLE1BQWM7UUFDakIsQ0FBQyxDQUFDLG9EQUFvRDtZQUNwRCxTQUFTLENBQUM7SUFFcEIsT0FBTyxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUcsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQyJ9