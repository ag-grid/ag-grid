#!/usr/bin/env tsx
/* eslint-disable no-console */
import { writeFileSync } from 'fs';

import type { CspEnv, CspMode } from '../../src/utils/htaccess/cspRules';
import {
    getCspHeaderName,
    getCspHtaccessBlock,
    getCspHtaccessLine,
    getCspValue,
} from '../../src/utils/htaccess/cspRules';

/**
 * Generate the Content-Security-Policy for a given environment
 *
 * Usage:
 *   tsx documentation/ag-grid-docs/scripts/csp/generate-csp.ts
 *       [--env=staging|production|dev]
 *       [--mode=report-only|enforce]
 *       [--format=htaccess|header|value]
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

function assertOneOf<T extends string>(value: string | undefined, allowed: T[], flag: string): T {
    if (value === undefined || !allowed.includes(value as T)) {
        throw new Error(`${flag} must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
}

function parseArgs(argv: string[]): { env: CspEnv; mode: CspMode; format: Format; out?: string } {
    let env: CspEnv = 'staging';
    let mode: CspMode = 'report-only';
    let format: Format = 'htaccess';
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
        } else if (key === '--out') {
            out = value;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return { env, mode, format, out };
}

function render(format: Format, env: CspEnv, mode: CspMode): string {
    if (format === 'value') {
        return getCspValue({ env });
    }
    if (format === 'header') {
        return `${getCspHeaderName(mode)}: ${getCspValue({ env })}`;
    }
    // Staging unsets the legacy vhost wildcard and fully owns the policy (block);
    // production runs dual-policy during its report-only window (bare line).
    return env === 'staging' ? getCspHtaccessBlock({ env }, mode) : getCspHtaccessLine({ env }, mode);
}

function main(): void {
    const { env, mode, format, out } = parseArgs(process.argv.slice(2));
    const output = render(format, env, mode);

    if (out) {
        writeFileSync(out, `${output}\n`);
        console.info(`[generate-csp] wrote ${env}/${mode} policy to ${out}`);
        return;
    }

    console.log(output);
}

main();
