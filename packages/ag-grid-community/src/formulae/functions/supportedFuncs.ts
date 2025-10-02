import { FormulaError } from '../ast/utils';
import { forEachNumber, readExactlyN, reduceAtLeastOne } from './utils';

export const MULTIPLY = (it: Iterator<unknown>): number => {
    // Empty multiplication returns 1
    let acc = 1;
    forEachNumber(it, 'MULTIPLY', (num) => {
        acc *= num;
    });
    return acc;
};
export const PRODUCT = MULTIPLY; // alias

export const DIVIDE = (it: Iterator<unknown>): number => {
    const [a, b] = readExactlyN(it, 'DIV', 2);
    if (b === 0) throw new FormulaError('DIV: division by zero', '#PARSE!');
    return a / b;
};
export const DIV = DIVIDE; // alias

export const SUM = (it: Iterator<unknown>): number => {
    let acc = 0;
    forEachNumber(it, 'SUM', (num) => {
        acc += num;
    });
    return acc;
};
export const ADD = SUM; // alias

export const MINUS = (it: Iterator<unknown>): number => {
    const [a, b] = readExactlyN(it, 'MINUS', 2);
    return a - b;
};

export const PERCENT = (it: Iterator<unknown>): number => {
    const [a] = readExactlyN(it, 'PERCENT', 1);
    return a / 100;
};

export const POWER = (it: Iterator<unknown>): number => {
    const [a, b] = readExactlyN(it, 'POWER', 2);
    return Math.pow(a, b);
};

export const MIN = (it: Iterator<unknown>): number => {
    return reduceAtLeastOne(it, 'MIN', (a, v) => (v < a ? v : a), null);
};

export const MAX = (it: Iterator<unknown>): number => {
    return reduceAtLeastOne(it, 'MAX', (a, v) => (v > a ? v : a), null);
};

export const AVG = (it: Iterator<unknown>): number => {
    let count = 0;
    let sum = 0;
    forEachNumber(it, 'AVG', (num) => {
        sum += num;
        count++;
    });
    if (count === 0) {
        throw new FormulaError('AVG: requires at least one value', '#PARSE!');
    }
    return sum / count;
};
