// The style guide reads Sass-only tokens (spacing, breakpoints, transition timing) by importing
// the design system's `.scss` files as text and parsing the declarations out, which keeps those
// sections from drifting away from `core/`.
//
// Vite declares `*?raw` in its own client types, but the docs app narrows `compilerOptions.types`,
// so that declaration is not guaranteed to be in scope here. Declaring the narrower specifier
// explicitly makes the guide type-check on its own terms rather than depending on which ambient
// types a consuming app happens to pull in.
declare module '*.scss?raw' {
    const source: string;
    export default source;
}
