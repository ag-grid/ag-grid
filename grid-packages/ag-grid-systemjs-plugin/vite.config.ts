import { join, relative, resolve, sep } from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import pkg from './package.json' assert { type: 'json' };

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, pkg.main),
      name: camelCase(pkg.name),
      formats: ['iife'],
      fileName: (format, entryName) => {
        const extension = format === 'iife' ? '.js' : `.${format}.js`;
        return `${entryName}${extension}`;
      },
    },
    rollupOptions: {
      output: {
        sourcemapPathTransform: fixRelativeSourcemapPaths({
          outputDir: join(__dirname, 'dist'),
          projectRoot: __dirname,
        }),
      },
    },
  },
  plugins: [nodePolyfills()],
});

function camelCase(dashed: string): string {
  return dashed.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function fixRelativeSourcemapPaths(options: {
  outputDir: string;
  projectRoot: string;
}): ((relativePath: string) => string) | undefined {
  // Rollup emits sourcemap paths relative to the 'dist' directory,
  // but we want the paths to be relative to the project root
  const { outputDir, projectRoot } = options;
  if (outputDir === projectRoot) return undefined;
  // Determine the relative path from the output directory to the project root
  const projectPath = `${relative(outputDir, projectRoot)}${sep}`;
  // Strip the project root path prefix from all sourcemap paths
  return (relativePath) => {
    if (relativePath.startsWith(projectPath)) return relativePath.slice(projectPath.length);
    return relativePath;
  };
}
