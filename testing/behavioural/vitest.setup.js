import '@testing-library/jest-dom/vitest';
import { vitest } from 'vitest';

// Do not use jest, use vitest, but here to avoid errors
global.jest = vitest;

/** The minimum stack trace length to use, to ensure we can see enough stack trace */
const MINIMUM_STACK_TRACE_LIMIT = 40;

if (Error.stackTraceLimit < MINIMUM_STACK_TRACE_LIMIT) {
    Error.stackTraceLimit = MINIMUM_STACK_TRACE_LIMIT;
}
