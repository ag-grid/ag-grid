import { FormulaError } from '../ast/utils';
import { coerceFiniteNumber, forEach, readExactlyN, reduceAtLeastOne } from './utils';

const MULTIPLY = (it: Iterator<unknown>): number => {
    // Empty multiplication returns 1
    let acc = 1;
    forEach(
        it,
        'MULTIPLY',
        (num) => {
            acc *= num;
        },
        coerceFiniteNumber
    );
    return acc;
};

const DIVIDE = (it: Iterator<unknown>): number => {
    const [a, b] = readExactlyN(it, 'DIV', 2, coerceFiniteNumber);
    if (b === 0) {
        throw new FormulaError('DIV: division by zero', '#PARSE!');
    }
    return a / b;
};

const SUM = (it: Iterator<unknown>): number => {
    let acc = 0;
    forEach(
        it,
        'SUM',
        (num) => {
            acc += num;
        },
        coerceFiniteNumber
    );
    return acc;
};

const MINUS = (it: Iterator<unknown>): number => {
    const [a, b] = readExactlyN(it, 'MINUS', 2, coerceFiniteNumber);
    return a - b;
};

const PERCENT = (it: Iterator<unknown>): number => {
    const [a] = readExactlyN(it, 'PERCENT', 1, coerceFiniteNumber);
    return a / 100;
};

const POWER = (it: Iterator<unknown>): number => {
    const [a, b] = readExactlyN(it, 'POWER', 2, coerceFiniteNumber);
    return Math.pow(a, b);
};

const MIN = (it: Iterator<unknown>): number => {
    return reduceAtLeastOne(it, 'MIN', (a, v) => (v < a ? v : a), null);
};

const MAX = (it: Iterator<unknown>): number => {
    return reduceAtLeastOne(it, 'MAX', (a, v) => (v > a ? v : a), null);
};

const AVG = (it: Iterator<unknown>): number => {
    let count = 0;
    let sum = 0;
    forEach(
        it,
        'AVG',
        (num) => {
            sum += num;
            count++;
        },
        coerceFiniteNumber
    );
    if (count === 0) {
        throw new FormulaError('AVG: requires at least one value', '#PARSE!');
    }
    return sum / count;
};

const CONCAT = (it: Iterator<unknown>): string => {
    let out = '';
    forEach(it, 'CONCAT', (v) => {
        if (v == null) {
            return;
        }
        switch (typeof v) {
            case 'string':
                out += v;
                return;
            case 'number':
                out += String(v);
                return;
            case 'boolean':
                out += v ? 'TRUE' : 'FALSE';
                return;
            default:
                throw new FormulaError('CONCAT: unsupported value type', '#PARSE!');
        }
    });
    return out;
};

const EQUALS = (it: Iterator<unknown>): boolean => {
    const [a, b] = readExactlyN(it, 'EQUALS', 2);
    return a === b;
};

const NOT_EQUALS = (it: Iterator<unknown>): boolean => {
    const [a, b] = readExactlyN(it, 'NOT_EQUALS', 2);
    return a !== b;
};

const GT = (it: Iterator<unknown>): boolean => {
    const [a, b] = readExactlyN(it, 'GT', 2);
    return a > b;
};

const GTE = (it: Iterator<unknown>): boolean => {
    const [a, b] = readExactlyN(it, 'GTE', 2);
    return a >= b;
};

const LT = (it: Iterator<unknown>): boolean => {
    const [a, b] = readExactlyN(it, 'LT', 2);
    return a < b;
};

const LTE = (it: Iterator<unknown>): boolean => {
    const [a, b] = readExactlyN(it, 'LTE', 2);
    return a <= b;
};

export default {
    MULTIPLY,
    PRODUCT: MULTIPLY,
    DIVIDE,
    DIV: DIVIDE,
    SUM,
    ADD: SUM,
    MINUS,
    PERCENT,
    POWER,
    MIN,
    MAX,
    AVG,

    CONCAT,
    CONCATENATE: CONCAT,

    EQ: EQUALS,
    NE: NOT_EQUALS,

    GT,
    GTE,
    LT,
    LTE,

    '+': SUM,
    '-': MINUS,
    '*': MULTIPLY,
    '/': DIVIDE,
    '^': POWER,
    '%': PERCENT,
    '=': EQUALS,
    '&': CONCAT,
    '<>': NOT_EQUALS,
    '>': GT,
    '>=': GTE,
    '<': LT,
    '<=': LTE,
};
