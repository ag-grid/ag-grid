import { existsSync } from 'fs';
import path from 'path';

let cachedRoot: string | undefined;

/**
 * Absolute path to the monorepo root.
 *
 * The generator reads a couple of workspace-relative assets (the Angular boilerplate, the
 * `GridOptions` type source). Under Nx those resolve against `process.cwd()`, which is always the
 * workspace root — but the executor is also called in-process by the docs dev server, whose cwd is
 * `documentation/ag-grid-docs`. Resolving the root explicitly keeps both callers working without
 * either of them having to change directory.
 */
export function getWorkspaceRoot(): string {
    if (cachedRoot) {
        return cachedRoot;
    }

    if (process.env.NX_WORKSPACE_ROOT_PATH) {
        cachedRoot = process.env.NX_WORKSPACE_ROOT_PATH;
        return cachedRoot;
    }

    let dir = process.cwd();
    while (!existsSync(path.join(dir, 'nx.json'))) {
        const parent = path.dirname(dir);
        if (parent === dir) {
            throw new Error(`Unable to locate the workspace root (no nx.json above ${process.cwd()})`);
        }
        dir = parent;
    }

    cachedRoot = dir;
    return cachedRoot;
}
