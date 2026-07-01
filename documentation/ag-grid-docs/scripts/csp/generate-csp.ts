#!/usr/bin/env tsx
/* eslint-disable no-console */
import { writeFileSync } from 'fs';

import type { CspEnv, CspMode, CspScope } from '../../src/utils/htaccess/cspRules';
import { getCspHeaderName, getCspValue, getScopedCspHtaccessBlock } from '../../src/utils/htaccess/cspRules';

/**
 * Generate the Content-Security-Policy for a given environment
 *
 * Usage:
 *   tsx documentation/ag-grid-docs/scripts/csp/generate-csp.ts
 *       [--env=staging|production|dev]
 *       [--mode=report-only|enforce]
 *       [--format=htaccess|header|value]
 *       [--scope=site|examples|campaigns|ecommerce]  (header/value formats only; htaccess emits all)
 *       [--out=<file>]
 *
 * Run via Nx:
 *   nx run ag-grid-docs:generate-csp                       # staging, report-only, .htaccess line
 *   nx run ag-grid-docs:generate-csp --mode=enforce --format=value
 *
 * Nx's run-commands reserves --env, so pass a non-default env by running the script
 * directly:
 *   tsx documentation/ag-grid-docs/scripts/csp/generate-csp.ts --env=production
 *
 * The policy itself lives in src/utils/htaccess/cspRules.ts (single source of
 * truth, shared with the .htaccess generator).
 */

type Format = 'htaccess' | 'header' | 'value';

const ENVS: CspEnv[] = ['dev', 'staging', 'production'];
const MODES: CspMode[] = ['report-only', 'enforce'];
const FORMATS: Format[] = ['htaccess', 'header', 'value'];
const SCOPES: CspScope[] = ['site', 'examples', 'campaigns', 'ecommerce'];

function assertOneOf<T extends string>(value: string | undefined, allowed: T[], flag: string): T {
    if (value === undefined || !allowed.includes(value as T)) {
        throw new Error(`${flag} must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
}

function parseArgs(argv: string[]): { env: CspEnv; mode: CspMode; format: Format; scope: CspScope; out?: string } {
    let env: CspEnv = 'staging';
    let mode: CspMode = 'report-only';
    let format: Format = 'htaccess';
    let scope: CspScope = 'site';
    let out: string | undefined;

    for (let i = 0, len = argv.length; i < len; ++i) {
        const arg = argv[i];
        const [key, inlineValue] = arg.split('=');
        const value = inlineValue ?? argv[++i];
        if (key === '--env') {
            env = assertOneOf(value, ENVS, '--env');
        } else if (key === '--mode') {
            mode = assertOneOf(value, MODES, '--mode');
        } else if (key === '--format') {
            format = assertOneOf(value, FORMATS, '--format');
        } else if (key === '--scope') {
            scope = assertOneOf(value, SCOPES, '--scope');
        } else if (key === '--out') {
            out = value;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return { env, mode, format, scope, out };
}

function render(format: Format, env: CspEnv, mode: CspMode, scope: CspScope): string {
    if (format === 'value') {
        return getCspValue({ env, scope });
    }
    if (format === 'header') {
        return `${getCspHeaderName(mode)}: ${getCspValue({ env, scope })}`;
    }
    // The htaccess format emits the full path-scoped block (site policy plus the
    // <If> override for example/archive paths) — what ships in the generated file.
    return getScopedCspHtaccessBlock({ env }, mode);
}

function main(): void {
    const { env, mode, format, scope, out } = parseArgs(process.argv.slice(2));
    const output = render(format, env, mode, scope);

    if (out) {
        writeFileSync(out, `${output}\n`);
        console.info(`[generate-csp] wrote ${env}/${mode} policy to ${out}`);
        return;
    }

    console.log(output);
}

main();
