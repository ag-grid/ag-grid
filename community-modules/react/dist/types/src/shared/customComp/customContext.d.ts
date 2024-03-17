/// <reference types="react" />
type CustomContextParams<M> = {
    setMethods: (methods: M) => void;
};
export declare const CustomContext: import("react").Context<CustomContextParams<any>>;
export {};
