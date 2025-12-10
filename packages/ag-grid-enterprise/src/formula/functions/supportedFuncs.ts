import { COUNT, COUNTA, COUNTBLANK, COUNTIF } from './counting/functions';
import { NOW, TODAY } from './dates/functions';
import { EQUALS, GT, GTE, IF, LT, LTE, MAX, MIN, NOT_EQUALS } from './logic/functions';
import { AVERAGE, DIVIDE, MEDIAN, MINUS, PERCENT, POWER, PRODUCT, RAND, SUM, SUMIF } from './numbers/functions';
import { CONCAT } from './strings/functions';

export default {
    // logic/date
    IF,
    NOW,
    TODAY,

    // arithmetic
    PRODUCT,
    // DIVIDE,
    // DIV: DIVIDE,
    SUM,
    ADD: SUM,
    SUMIF,
    // MINUS,
    // PERCENT,
    POWER,
    MIN,
    MAX,
    AVERAGE,
    MEDIAN,

    // counting
    COUNT,
    COUNTA,
    COUNTBLANK,
    COUNTIF,

    // random
    RAND,

    // text
    CONCAT,
    CONCATENATE: CONCAT,

    // comparisons
    // EQ: EQUALS,
    // NE: NOT_EQUALS,
    // GT,
    // GTE,
    // LT,
    // LTE,

    // operator aliases
    '+': SUM,
    '-': MINUS,
    '*': PRODUCT,
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
