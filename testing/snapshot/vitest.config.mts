import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom', // Use jsdom to provide a browser-like environment
    },
});
