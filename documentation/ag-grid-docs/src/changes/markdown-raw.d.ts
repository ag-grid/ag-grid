/**
 * Vite raw imports: `import text from './file.md?raw'` inlines the file as a string at
 * build time. Used by changes database records to keep long markdown out of the .ts files.
 */
declare module '*.md?raw' {
    const content: string;
    export default content;
}
