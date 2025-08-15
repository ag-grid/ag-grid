/// <reference types="vitest" />
interface CustomMatchers<R = unknown> {
    toHaveValue(value?: string | string[] | boolean | number | null | unknown): R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}

export {};
