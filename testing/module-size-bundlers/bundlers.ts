import react from '@vitejs/plugin-react';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { build as viteBuild } from 'vite';
import webpack from 'webpack';

/**
 * Each bundler builds the same app in production mode, targeting es2020 so the measurement reflects the grid's
 * own code rather than a bundler's default syntax lowering.
 */
export interface Bundler {
    /** Shown in the module size report next to the module names. */
    name: string;
    /** Builds `entry` into `outDir` and returns the emitted JavaScript files. */
    build(entry: string, outDir: string): Promise<string[]>;
}

// packages/ag-grid-react has its own React 17 for development; without this its imports bundle a second copy of React.
const REACT_ALIASES = Object.fromEntries(
    ['react', 'react-dom'].map((name) => [
        name,
        path.dirname(createRequire(import.meta.url).resolve(`${name}/package.json`)),
    ])
);

function listJavaScript(dir: string): string[] {
    return fs
        .readdirSync(dir, { recursive: true, encoding: 'utf8' })
        .filter((file) => file.endsWith('.js'))
        .map((file) => path.join(dir, file));
}

const vite8: Bundler = {
    name: 'Vite 8',
    async build(entry, outDir) {
        const root = path.dirname(entry);
        fs.writeFileSync(
            path.join(root, 'index.html'),
            `<div id="root"></div><script type="module" src="./${path.basename(entry)}"></script>`
        );
        await viteBuild({
            root,
            configFile: false,
            logLevel: 'error',
            plugins: [react()],
            resolve: { alias: REACT_ALIASES },
            build: { target: 'es2020', outDir, emptyOutDir: true },
        });
        return listJavaScript(outDir);
    },
};

const webpack5: Bundler = {
    name: 'webpack 5',
    async build(entry, outDir) {
        const compiler = webpack({
            mode: 'production',
            entry,
            context: path.dirname(entry),
            devtool: false,
            output: { path: outDir, filename: 'main.js', clean: true },
            resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs'], alias: REACT_ALIASES },
            module: {
                rules: [
                    {
                        test: /\.[jt]sx$/,
                        loader: 'esbuild-loader',
                        options: { loader: 'tsx', jsx: 'automatic', target: 'es2020' },
                    },
                ],
            },
            optimization: { splitChunks: false, runtimeChunk: false },
            performance: { hints: false },
        });

        await new Promise<void>((resolve, reject) => {
            compiler.run((error, stats) => {
                if (error || stats?.hasErrors()) {
                    reject(error ?? new Error(stats?.toString({ all: false, errors: true })));
                } else {
                    resolve();
                }
            });
        });
        return listJavaScript(outDir);
    },
};

export const BUNDLERS: Bundler[] = [vite8, webpack5];
