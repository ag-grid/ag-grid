import vue from '@vitejs/plugin-vue';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 8085,
    },
    preview: {
        port: 8085,
    },
    build: {
        minify: false,
        rollupOptions: {
            onwarn(warning, warn) {
                // ant-design-vue@3.2.x (transitive from @mobileaction/action-kit) places
                // /* #__PURE__ */ annotations in non-standard positions in its ESM build.
                if (warning.code === 'INVALID_ANNOTATION') {
                    return;
                }
                warn(warning);
            },
        },
    },
});
