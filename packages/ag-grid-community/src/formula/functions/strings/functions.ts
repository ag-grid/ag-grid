import { FormulaError } from '../../ast/utils';
import type { FormulaFunctionParams } from '../types';

export const CONCAT = ({ values }: FormulaFunctionParams): string => {
    let out = '';
    for (const v of values) {
        if (v == null) continue;
        switch (typeof v) {
            case 'string': {
                out += v;
                break;
            }
            case 'number': {
                out += String(v);
                break;
            }
            case 'boolean': {
                out += v ? 'TRUE' : 'FALSE';
                break;
            }
            case 'object': {
                out += v.toString();
                break;
            }
            default: {
                throw new FormulaError('CONCAT: unsupported value type', '#VALUE!');
            }
        }
    }
    return out;
};
