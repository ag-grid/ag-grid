import {
    buildBaseline,
    computeGate,
    findUnaccountedClones,
    fingerprint,
    main,
    rebaseReportPaths,
} from '../../../../scripts/ci/jscpd-baseline-check.mjs';

// The unit under test is the workspace-root CI script. It lives here because `scripts/` is not an
// Nx project and appears in none of `vitest.workspace.ts`'s projects, so a co-located spec there
// would never run. Every case uses fixture report/baseline JSON — never a real jscpd scan.

const REPORT_PATH = 'node_modules/.cache/jscpd/jscpd-report.json';
const BASELINE_PATH = '.jscpd-baseline.json';

function makeClone(firstName, secondName, lines, fragment) {
    return {
        firstFile: { name: firstName, start: 10 },
        secondFile: { name: secondName, start: 200 },
        lines,
        tokens: lines * 4,
        format: 'typescript',
        fragment,
    };
}

function makeReport(duplicates, totalOverrides = {}) {
    return {
        duplicates,
        statistics: {
            total: {
                clones: duplicates.length,
                duplicatedLines: duplicates.reduce((sum, entry) => sum + entry.lines, 0),
                duplicatedTokens: 0,
                lines: 10000,
                tokens: 50000,
                sources: 42,
                percentage: 1.23456,
                percentageTokens: 1.1,
                ...totalOverrides,
            },
        },
    };
}

/** Two gated clones inside `packages/**`, 30 duplicated lines in total. */
function baseFixture() {
    return makeReport([
        makeClone('packages/ag-grid-community/src/a.ts', 'packages/ag-grid-enterprise/src/b.ts', 12, 'alpha\nbeta'),
        makeClone('packages/ag-grid-community/src/c.ts', 'packages/ag-grid-community/src/c.ts', 18, 'gamma\ndelta'),
    ]);
}

function baselineFor(report, scope = ['packages/**']) {
    return buildBaseline(report, scope);
}

function run(argv, { report, baseline, env = {} } = {}) {
    const writes = [];
    const out = [];
    const errors = [];
    const exitCode = main(argv, {
        scan: () => {},
        readJson: (filePath) => {
            if (filePath === REPORT_PATH) {
                return report;
            }
            if (filePath === BASELINE_PATH) {
                if (baseline === undefined) {
                    throw new Error('ENOENT: no such file');
                }
                if (baseline === 'malformed') {
                    throw new Error('Unexpected token } in JSON');
                }
                return baseline;
            }
            throw new Error(`unexpected read of ${filePath}`);
        },
        writeJson: (filePath, value) => writes.push({ filePath, value }),
        log: (message) => out.push(String(message)),
        logError: (message) => errors.push(String(message)),
        env,
    });
    return { exitCode, writes, stdout: out.join('\n'), stderr: errors.join('\n') };
}

describe('jscpd-baseline-check', () => {
    describe('gate scoping', () => {
        test('counts only clones with both files inside the scope', () => {
            const report = makeReport([
                makeClone('packages/ag-grid-community/src/a.ts', 'packages/ag-grid-community/src/b.ts', 12, 'x'),
                // straddles the boundary: reported, but not gated
                makeClone('community-modules/locale/src/en-US.ts', 'packages/ag-grid-enterprise/src/t.ts', 210, 'y'),
                // wholly outside
                makeClone('testing/behavioural/src/a.ts', 'testing/behavioural/src/b.ts', 40, 'z'),
            ]);

            const gate = computeGate(report, ['packages/**']);

            expect(gate.clones).toBe(1);
            expect(gate.duplicatedLines).toBe(12);
        });

        test('counts intra-file clones', () => {
            const report = makeReport([
                makeClone('packages/ag-grid-community/src/a.ts', 'packages/ag-grid-community/src/a.ts', 15, 'x'),
            ]);

            expect(computeGate(report, ['packages/**']).clones).toBe(1);
        });
    });

    describe('rebaseReportPaths', () => {
        test('re-roots the scan-relative paths jscpd emits', () => {
            const report = makeReport([
                makeClone('ag-grid-community/src/a.ts', 'ag-grid-enterprise/src/b.ts', 12, 'x'),
            ]);

            rebaseReportPaths(report, 'packages');

            expect(computeGate(report, ['packages/**']).clones).toBe(1);
        });

        test('re-reads the fragment jscpd leaves empty on a non-root scan', () => {
            const clone = makeClone('ag-grid-community/src/a.ts', 'ag-grid-community/src/b.ts', 2, '');
            clone.firstFile.startLoc = { line: 2 };
            clone.firstFile.endLoc = { line: 3 };
            const report = makeReport([clone]);

            rebaseReportPaths(report, 'packages', (name) => {
                expect(name).toBe('packages/ag-grid-community/src/a.ts');
                return ['one', 'two', 'three', 'four'];
            });

            expect(clone.fragment).toBe('two\nthree');
        });
    });

    describe('findUnaccountedClones', () => {
        test('treats a repeat of an already-duplicated fragment as unaccounted', () => {
            const report = makeReport([
                makeClone('packages/a/x.ts', 'packages/a/y.ts', 12, 'shared'),
                makeClone('packages/a/x.ts', 'packages/a/z.ts', 12, 'shared'),
            ]);
            const gate = computeGate(report, ['packages/**']);

            // The baseline knew about one occurrence of this fragment; the second is new.
            expect(findUnaccountedClones(gate, [fingerprint('shared')])).toHaveLength(1);
        });

        test('returns nothing when every clone is accounted for', () => {
            const report = baseFixture();
            const gate = computeGate(report, ['packages/**']);

            expect(findUnaccountedClones(gate, gate.fingerprints)).toEqual([]);
        });
    });

    describe('fingerprints', () => {
        test('survive whitespace-only reformatting', () => {
            expect(fingerprint('const a = 1;\n\n  const b = 2;  ')).toBe(fingerprint('const   a = 1;\nconst b = 2;'));
        });

        test('differ for different code', () => {
            expect(fingerprint('const a = 1;')).not.toBe(fingerprint('const a = 2;'));
        });
    });

    describe('check mode', () => {
        test('passes and writes nothing when the gated counts match the baseline', () => {
            const report = baseFixture();

            const result = run([], { report, baseline: baselineFor(report) });

            expect(result.exitCode).toBe(0);
            expect(result.writes).toEqual([]);
            expect(result.stdout).toContain('2 gated in packages/**');
        });

        test('fails when the gated clone count increases, naming the delta and the new clones', () => {
            const baseline = baselineFor(baseFixture());
            const report = baseFixture();
            report.duplicates.push(
                makeClone('packages/ag-grid-community/src/new.ts', 'packages/ag-grid-vue3/src/new.ts', 25, 'brand new')
            );
            report.statistics.total.clones = report.duplicates.length;

            const result = run([], { report, baseline });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('Duplicate code increased inside packages/**');
            expect(result.stderr).toContain('clones:          2 -> 3 (+1)');
            expect(result.stderr).toContain('duplicatedLines: 30 -> 55 (+25)');
            expect(result.stderr).toContain('packages/ag-grid-community/src/new.ts:10');
            expect(result.stderr).toContain('yarn nx lint:jscpd:baseline all');
            expect(result.writes).toEqual([]);
        });

        test('fails when duplicatedLines increases while the clone count stays flat', () => {
            const baseline = baselineFor(baseFixture());
            const report = baseFixture();
            report.duplicates[0].lines = 40;

            const result = run([], { report, baseline });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('clones:          2 -> 2 (0)');
            expect(result.stderr).toContain('duplicatedLines: 30 -> 58 (+28)');
            // The fragment is unchanged, so no fingerprint is new — the message must still
            // point at the largest gated clones rather than listing nothing.
            expect(result.stderr).toContain('No unrecognised fragments');
            expect(result.stderr).toContain('packages/ag-grid-community/src/a.ts:10');
        });

        test('passes on a decrease, printing a notice and writing nothing', () => {
            const baseline = baselineFor(baseFixture());
            const report = makeReport([baseFixture().duplicates[0]]);

            const result = run([], { report, baseline });

            expect(result.exitCode).toBe(0);
            expect(result.writes).toEqual([]);
            expect(result.stdout).toContain('Duplicate code decreased inside packages/**');
            expect(result.stdout).toContain('yarn nx lint:jscpd:baseline all');
        });

        test('formats the decrease notice as a GitHub notice under CI', () => {
            const baseline = baselineFor(baseFixture());
            const report = makeReport([baseFixture().duplicates[0]]);

            const result = run([], { report, baseline, env: { CI: 'true' } });

            expect(result.stdout).toContain('::notice::Duplicate code decreased');
        });

        test('fails when jscpd scanned no files', () => {
            const report = makeReport([], { sources: 0 });

            const result = run([], { report, baseline: baselineFor(baseFixture()) });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('jscpd scanned 0 files');
        });

        test('fails with a clear error when the baseline is missing', () => {
            const result = run([], { report: baseFixture(), baseline: undefined });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('Could not read the baseline');
            expect(result.stderr).toContain('yarn nx lint:jscpd:baseline all');
        });

        test('fails when the report has no duplicates array', () => {
            const report = baseFixture();
            delete report.duplicates;

            const result = run([], { report, baseline: baselineFor(baseFixture()) });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('no duplicates array');
        });

        test('fails when the gate matches nothing but the baseline is not empty', () => {
            const baseline = baselineFor(baseFixture());
            const report = makeReport([
                makeClone('testing/behavioural/src/a.ts', 'testing/behavioural/src/b.ts', 40, 'outside'),
            ]);

            const result = run([], { report, baseline });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('No clones matched packages/**');
        });

        test('fails on a scope glob using unsupported brace syntax', () => {
            const baseline = baselineFor(baseFixture());
            baseline.gate.scope = ['{packages,community-modules}/**'];

            const result = run([], { report: baseFixture(), baseline });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('supports only the * and ** wildcards');
        });

        test('fails on an empty scope array', () => {
            const baseline = baselineFor(baseFixture());
            baseline.gate.scope = [];

            const result = run([], { report: baseFixture(), baseline });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('must be a non-empty array');
        });

        test('fails when the baseline has no numeric gate block', () => {
            const result = run([], { report: baseFixture(), baseline: { gate: { scope: ['packages/**'] } } });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('no numeric gate.clones');
        });

        test('fails when the jscpd scan itself fails', () => {
            const errors = [];
            const exitCode = main([], {
                scan: () => {
                    throw new Error('binary not found');
                },
                readJson: () => {
                    throw new Error('should not be reached');
                },
                logError: (message) => errors.push(String(message)),
                log: () => {},
            });

            expect(exitCode).toBe(1);
            expect(errors.join('\n')).toContain('jscpd failed to run: binary not found');
        });
    });

    describe('--update mode', () => {
        test('rewrites the baseline with both the report and gate blocks', () => {
            const report = baseFixture();

            const result = run(['--update'], { report, baseline: baselineFor(report) });

            expect(result.exitCode).toBe(0);
            expect(result.writes).toHaveLength(1);
            const [write] = result.writes;
            expect(write.filePath).toBe(BASELINE_PATH);
            expect(write.value.report).toEqual({
                sources: 42,
                clones: 2,
                duplicatedLines: 30,
                percentage: 1.23,
            });
            expect(write.value.gate).toEqual({
                scope: ['packages/**'],
                clones: 2,
                duplicatedLines: 30,
                fingerprints: [fingerprint('alpha\nbeta'), fingerprint('gamma\ndelta')].sort(),
            });
        });

        test('bootstraps the default scope when no baseline exists yet', () => {
            const result = run(['--update'], { report: baseFixture(), baseline: undefined });

            expect(result.exitCode).toBe(0);
            expect(result.writes[0].value.gate.scope).toEqual([
                'packages/ag-grid-community/src/**',
                'packages/ag-grid-enterprise/src/**',
                'packages/ag-stack/src/**',
            ]);
        });

        test('rejects unknown arguments without running a scan', () => {
            const result = run(['--tighten'], { report: baseFixture(), baseline: baselineFor(baseFixture()) });

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('Unknown argument(s): --tighten');
            expect(result.writes).toEqual([]);
        });
    });
});
