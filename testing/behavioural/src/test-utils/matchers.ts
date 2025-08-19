// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./matchers.d.ts" />
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

/**
 * Extend built-in toHaveValue matcher.
 * This matcher is used to check the value of form elements like input, select, and textarea.
 * It handles different input types such as checkbox, radio, number, date, and time.
 */
expect.extend({
    ...(matchers as any),
    toHaveValue(received: HTMLElement, expected: unknown) {
        const tag = received?.tagName?.toLowerCase();
        const type = (received as HTMLInputElement)?.type;

        if (tag === 'input') {
            let receivedValue: unknown;
            let expectedValue: unknown = expected;
            let pass: boolean | undefined = undefined;

            if (type === 'checkbox' || type === 'radio') {
                receivedValue = (received as HTMLInputElement).checked;
                pass = receivedValue === expected;
            } else if (type === 'number' || type === 'range') {
                receivedValue = (received as HTMLInputElement).valueAsNumber;

                if (expected !== undefined && receivedValue !== undefined && isNaN(expected as number)) {
                    pass = isNaN(receivedValue as number);
                } else {
                    expectedValue = typeof expected === 'string' ? parseFloat(expected) : expected;
                    pass = receivedValue === expectedValue;
                }
            } else if (['date', 'datetime-local', 'time'].includes(type)) {
                receivedValue = (received as HTMLInputElement).valueAsDate;
                if (expected instanceof Date) {
                    expectedValue = expected;
                } else if (typeof expected === 'string') {
                    expectedValue = new Date(expected);
                }
                pass = (receivedValue as Date)?.getTime() === (expectedValue as Date)?.getTime();
            }

            if (pass !== undefined) {
                return {
                    pass,
                    message: () => createMessage(tag, receivedValue, expectedValue, pass!),
                };
            }
        } else if (tag === 'select' || tag === 'textarea') {
            const receivedValue = (received as HTMLSelectElement | HTMLTextAreaElement).value;
            const expectedValue = String(expected);
            const pass = receivedValue === expectedValue;
            return {
                pass,
                message: () => createMessage(tag, receivedValue, expectedValue, pass),
            };
        }

        return (matchers.toHaveValue as any).bind(this)(received, expected as any);
    },
});

function createMessage(tag: string, received: unknown, expected: unknown, pass: boolean): string {
    return `Expected ${tag} value ${received} ${pass ? 'not ' : ''}to equal ${expected}`;
}

export { expect };
