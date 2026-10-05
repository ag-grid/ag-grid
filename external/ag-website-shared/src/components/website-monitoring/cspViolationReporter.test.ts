// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { vi } from 'vitest';

import type { CspViolationReporter } from './cspViolationReporter';
import { createCspViolationReporter } from './cspViolationReporter';

// jsdom has no SecurityPolicyViolationEvent, so build one with the fields the reporter reads
function dispatchViolation(overrides: Partial<SecurityPolicyViolationEvent> = {}) {
    const event = Object.assign(new Event('securitypolicyviolation'), {
        effectiveDirective: 'script-src-elem',
        blockedURI: 'inline',
        sourceFile: 'https://www.ag-grid.com/contact/',
        lineNumber: 12,
        disposition: 'enforce',
        ...overrides,
    });
    document.dispatchEvent(event);
}

const CSP_VIOLATION_BUFFER_SCRIPT = readFileSync(join(__dirname, 'cspViolationBuffer.js'), 'utf8');

describe('createCspViolationReporter', () => {
    let reporter: CspViolationReporter | undefined;
    const send = vi.fn();

    beforeEach(() => {
        send.mockClear();
        delete (window as any).agCspViolations;
        reporter = createCspViolationReporter(send);
    });

    afterEach(() => {
        reporter?.dispose();
    });

    test('holds violations until started, then sends them', () => {
        dispatchViolation();
        expect(send).not.toHaveBeenCalled();

        reporter!.start();

        expect(send).toHaveBeenCalledWith({
            directive: 'script-src-elem',
            blockedUri: 'inline',
            sourceFile: 'https://www.ag-grid.com/contact/',
            lineNumber: 12,
            disposition: 'enforce',
        });
    });

    test('sends violations as they happen once started', () => {
        reporter!.start();
        dispatchViolation();

        expect(send).toHaveBeenCalledTimes(1);
    });

    test('sends each distinct violation once per page', () => {
        reporter!.start();
        dispatchViolation();
        dispatchViolation();
        dispatchViolation({ lineNumber: 40 });

        expect(send).toHaveBeenCalledTimes(2);
    });

    test('drops query strings, which can carry anything', () => {
        reporter!.start();
        dispatchViolation({
            blockedURI: 'https://example.com/collect?email=someone%40example.com',
            sourceFile: 'https://www.ag-grid.com/contact/?utm_source=newsletter',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                blockedUri: 'https://example.com/collect',
                sourceFile: 'https://www.ag-grid.com/contact/',
            })
        );
    });

    test('never sends violations it was told to discard', () => {
        dispatchViolation();
        reporter!.discard();
        reporter!.start();

        expect(send).not.toHaveBeenCalled();
    });

    test('holds at most 20 violations before starting', () => {
        for (let i = 0; i < 30; i++) {
            dispatchViolation({ lineNumber: i });
        }
        reporter!.start();

        expect(send).toHaveBeenCalledTimes(20);
    });

    test('ignores the eval that the CSP knowingly blocks in the Enzuzo cookie banner', () => {
        reporter!.start();
        dispatchViolation({
            effectiveDirective: 'script-src',
            blockedURI: 'eval',
            sourceFile: 'https://app.enzuzo.com/scripts/cookiebar/061e8460-91b3-11f1-98ff-978c2fcf2681',
        });

        expect(send).not.toHaveBeenCalled();
    });

    test('still reports an eval from anywhere else', () => {
        reporter!.start();
        dispatchViolation({
            effectiveDirective: 'script-src',
            blockedURI: 'eval',
            sourceFile: 'https://cdn.example.com/widget.js',
        });

        expect(send).toHaveBeenCalledWith(expect.objectContaining({ blockedUri: 'eval' }));
    });

    test('stops listening once disposed', () => {
        reporter!.start();
        reporter!.dispose();
        dispatchViolation();

        expect(send).not.toHaveBeenCalled();
    });

    describe('with the early buffer script', () => {
        // Each run of the buffer script adds a listener, so tests share one, as a page would
        beforeAll(() => {
            new Function(CSP_VIOLATION_BUFFER_SCRIPT)();
        });

        beforeEach(() => {
            reporter?.dispose();
            (window as any).agCspViolations = [];
        });

        test('reports violations from before the reporter existed', () => {
            dispatchViolation({ blockedURI: 'eval' });
            reporter = createCspViolationReporter(send);
            reporter.start();

            expect(send).toHaveBeenCalledWith(expect.objectContaining({ blockedUri: 'eval' }));
        });

        test('reports each violation once after the reporter takes over', () => {
            reporter = createCspViolationReporter(send);
            reporter.start();
            dispatchViolation({ lineNumber: 1 });
            dispatchViolation({ lineNumber: 2 });

            expect(send).toHaveBeenCalledTimes(2);
        });
    });
});
