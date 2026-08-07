/**
 * Updates the "Supported Versions" table in a SECURITY.md file.
 *
 * The table is a two-column markdown table where the FIRST data row is the LTS
 * version and the LAST data row is the latest supported version. Each version
 * cell is written as `{major}.x`.
 *
 * Usage:
 *   tsx update-security-versions.ts --type <latest|lts> --version <full-semver> [--file SECURITY.md] [--dry-run]
 *
 *   tsx update-security-versions.ts --type latest --version 37.0.0
 *   tsx update-security-versions.ts --type lts    --version 33.0.0 --file SECURITY.md
 *   tsx update-security-versions.ts --type latest --version 37.0.0 --dry-run
 *
 * Options:
 *   --type     (required) `latest` updates the last data row, `lts` updates the first data row.
 *   --version  (required) full semver (e.g. 37.0.0 or 37.0.0-beta.1); the major is written as `{major}.x`.
 *   --file     path to the target file (default: ./SECURITY.md, resolved from the current working directory).
 *   --dry-run  print the resulting table to stdout without writing.
 *
 * Idempotent: if the target row already holds `{major}.x` the file is left unchanged. This makes it
 * safe to call on every release — the latest row only changes when the major version changes.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

type RowType = 'latest' | 'lts';

interface Args {
    type: RowType;
    version: string;
    file: string;
    dryRun: boolean;
}

const USAGE =
    'Usage: tsx update-security-versions.ts --type <latest|lts> --version <full-semver> [--file SECURITY.md] [--dry-run]';

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-.+)?$/;

function fail(message: string): never {
    console.error(`ERROR: ${message}`);
    console.error(USAGE);
    process.exit(1);
}

function parseArgs(argv: string[]): Args {
    let type: string | undefined;
    let version: string | undefined;
    let file = 'SECURITY.md';
    let dryRun = false;

    for (let i = 0, len = argv.length; i < len; ++i) {
        const arg = argv[i];
        const eq = arg.indexOf('=');
        const key = eq === -1 ? arg : arg.slice(0, eq);
        const inlineValue = eq === -1 ? undefined : arg.slice(eq + 1);
        const nextValue = (): string => {
            const value = inlineValue ?? argv[++i];
            if (value === undefined) {
                fail(`Missing value for ${key}`);
            }
            return value;
        };

        if (key === '--type') {
            type = nextValue();
        } else if (key === '--version') {
            version = nextValue();
        } else if (key === '--file') {
            file = nextValue();
        } else if (key === '--dry-run') {
            dryRun = true;
        } else {
            fail(`Unknown argument: ${arg}`);
        }
    }

    if (type !== 'latest' && type !== 'lts') {
        fail('--type must be either "latest" or "lts"');
    }
    if (!version) {
        fail('--version is required');
    }
    if (!SEMVER_REGEX.test(version)) {
        fail(`--version must be a full semver (e.g. 37.0.0), received: ${version}`);
    }

    return { type, version, file, dryRun };
}

function isSeparatorRow(line: string): boolean {
    return /^\s*\|[\s:|-]+\|\s*$/.test(line);
}

function isTableRow(line: string): boolean {
    return /^\s*\|/.test(line);
}

/** Replace the first cell's value while preserving the cell's column width for alignment. */
function replaceVersionCell(rowLine: string, newVersion: string): string {
    const cells = rowLine.split('|');
    // cells[0] is the empty string before the leading pipe; cells[1] is the first (version) cell.
    if (cells.length < 3) {
        fail(`Malformed table row: ${rowLine}`);
    }
    const originalCell = cells[1];
    const newCell = ` ${newVersion}`.padEnd(originalCell.length);
    cells[1] = newCell;
    return cells.join('|');
}

function main(): void {
    const args = parseArgs(process.argv.slice(2));
    const filePath = resolve(process.cwd(), args.file);
    const newVersion = `${args.version.split('.')[0]}.x`;

    const contents = readFileSync(filePath, 'utf-8');
    const lines = contents.split('\n');

    // Locate the contiguous block of markdown table rows.
    let blockStart = -1;
    let blockEnd = -1;
    for (let i = 0, len = lines.length; i < len; ++i) {
        if (isTableRow(lines[i])) {
            if (blockStart === -1) {
                blockStart = i;
            }
            blockEnd = i;
        } else if (blockStart !== -1) {
            break;
        }
    }

    if (blockStart === -1) {
        fail(`No markdown table found in ${filePath}`);
    }

    // Data rows are the table rows after the header + separator rows.
    const dataRowIndices: number[] = [];
    for (let i = blockStart; i <= blockEnd; ++i) {
        if (!isSeparatorRow(lines[i]) && i > blockStart) {
            dataRowIndices.push(i);
        }
    }

    if (dataRowIndices.length === 0) {
        fail(`No data rows found in the table in ${filePath}`);
    }

    const targetIndex = args.type === 'lts' ? dataRowIndices[0] : dataRowIndices[dataRowIndices.length - 1];
    const targetLine = lines[targetIndex];
    const currentVersion = targetLine.split('|')[1].trim();

    if (currentVersion === newVersion) {
        console.log(`SECURITY.md ${args.type} row already up to date (${newVersion}) — no change.`);
        return;
    }

    lines[targetIndex] = replaceVersionCell(targetLine, newVersion);
    const updatedContents = lines.join('\n');

    if (args.dryRun) {
        console.log(`[dry-run] Would update ${args.type} row: ${currentVersion} -> ${newVersion}`);
        const tableLines = lines.slice(blockStart, blockEnd + 1);
        console.log(tableLines.join('\n'));
        return;
    }

    writeFileSync(filePath, updatedContents);
    console.log(`Updated SECURITY.md ${args.type} row: ${currentVersion} -> ${newVersion} (${filePath})`);
}

main();
