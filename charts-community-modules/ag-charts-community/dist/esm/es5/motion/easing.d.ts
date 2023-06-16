interface EasingOpts<T> {
    from: T;
    to: T;
}
export declare type Easing<T> = (opts: EasingOpts<T>) => (time: number) => T;
export declare function linear<T>({ from, to }: EasingOpts<T>): (time: number) => T;
export declare const easeIn: Easing<any>;
export declare const easeOut: Easing<any>;
export declare const easeInOut: Easing<any>;
export declare const easeOutElastic: Easing<any>;
export {};
//# sourceMappingURL=easing.d.ts.map