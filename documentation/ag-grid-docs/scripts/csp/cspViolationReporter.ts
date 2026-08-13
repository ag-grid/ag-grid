import type { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'node:fs';
import path from 'node:path';

import type { CspHashHint, CspViolationRecord, CspViolationReport } from '../../src/utils/csp/cspViolationReport';
import {
    CSP_HASH_HINT_ANNOTATION,
    CSP_VIOLATION_ANNOTATION,
    aggregateCspViolations,
} from '../../src/utils/csp/cspViolationReport';

interface Options {
    outputFile: string;
}

/** Relative to the working directory the suite runs from, as with the sibling CTRF reporter. */
const DEFAULT_OUTPUT_FILE = '../../reports/ag-grid-csp-violations.json';

/**
 * Writes the CSP violations the suite recorded to a JSON report, so CI can raise them with the
 * team that owns the policy without failing the run. The file is written even when clean: the
 * workflow compares it against the previous run's, so absence has to mean "no data" rather than
 * "nothing was blocked".
 */
export default class CspViolationReporter implements Reporter {
    private readonly outputFile: string;
    private readonly records: { record: CspViolationRecord; testTitle: string }[] = [];
    private readonly hints: CspHashHint[] = [];
    private baseUrl?: string;

    constructor(options: Partial<Options> = {}) {
        this.outputFile = options.outputFile ?? DEFAULT_OUTPUT_FILE;
    }

    onBegin(config: FullConfig): void {
        this.baseUrl = config.projects.map((project) => project.use.baseURL).find(Boolean);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        for (const annotation of result.annotations) {
            if (!annotation.description) {
                continue;
            }
            if (annotation.type === CSP_VIOLATION_ANNOTATION) {
                this.records.push({ record: JSON.parse(annotation.description), testTitle: test.title });
            } else if (annotation.type === CSP_HASH_HINT_ANNOTATION) {
                this.hints.push(JSON.parse(annotation.description));
            }
        }
    }

    onEnd(): void {
        const report: CspViolationReport = {
            baseUrl: this.baseUrl,
            violations: aggregateCspViolations(this.records, this.hints),
        };

        fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
        fs.writeFileSync(this.outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

        const enforced = report.violations.filter((violation) => violation.disposition === 'enforce').length;
        process.stdout.write(
            `CSP report written to ${this.outputFile}: ${enforced} enforced, ` +
                `${report.violations.length - enforced} report-only.\n`
        );
    }
}
