interface BaseOperatorDef {
    symbol: string;
    precedence: number;
}

export interface InfixOpDef extends BaseOperatorDef {
    fixity: 'infix';
    associativity: 'left' | 'right';
    isAssociative?: true;
}

interface ExternalOpDef extends BaseOperatorDef {
    fixity: 'prefix' | 'postfix';
}

export type OperatorDef = InfixOpDef | ExternalOpDef;

const OP_DEFS: OperatorDef[] = [
    { symbol: '%', fixity: 'postfix', precedence: 100 },

    { symbol: '-', fixity: 'prefix', precedence: 90 },
    { symbol: '+', fixity: 'prefix', precedence: 90 },

    { symbol: '^', fixity: 'infix', precedence: 80, associativity: 'right' },
    { symbol: '*', fixity: 'infix', precedence: 70, associativity: 'left', isAssociative: true },
    { symbol: '/', fixity: 'infix', precedence: 70, associativity: 'left' },

    { symbol: '+', fixity: 'infix', precedence: 60, associativity: 'left', isAssociative: true },
    { symbol: '-', fixity: 'infix', precedence: 60, associativity: 'left' },

    { symbol: '&', fixity: 'infix', precedence: 55, associativity: 'left', isAssociative: true },
    { symbol: '=', fixity: 'infix', precedence: 50, associativity: 'left' },
    { symbol: '<>', fixity: 'infix', precedence: 50, associativity: 'left' },
    { symbol: '>=', fixity: 'infix', precedence: 50, associativity: 'left' },
    { symbol: '<=', fixity: 'infix', precedence: 50, associativity: 'left' },
    { symbol: '>', fixity: 'infix', precedence: 50, associativity: 'left' },
    { symbol: '<', fixity: 'infix', precedence: 50, associativity: 'left' },
];

// array because some symbols have multiple defs (e.g., '-' is prefix and infix)
const symbolOperatorMap = new Map<string, OperatorDef[]>();

for (const d of OP_DEFS) {
    const s = symbolOperatorMap.get(d.symbol) ?? [];
    s.push(d);
    symbolOperatorMap.set(d.symbol, s);
}

/** Return the operator def for a given symbol and (optionally) fixity. */
export function getDefBySymbol(symbol: string, fixity: 'infix'): InfixOpDef | undefined;
export function getDefBySymbol(symbol: string, fixity: 'prefix' | 'postfix'): ExternalOpDef | undefined;
export function getDefBySymbol(symbol: string, fixity?: 'prefix' | 'infix' | 'postfix'): OperatorDef | undefined {
    const arr = symbolOperatorMap.get(symbol) ?? [];
    return fixity ? arr.find((d) => d.fixity === fixity) : arr[0];
}

/** Greedy operator list for tokenization (longest-first). */
export const OP_SYMBOLS_DESC = [...new Set(OP_DEFS.map((d) => d.symbol))].sort((a, b) => b.length - a.length);

/** OperatorDefs mapped by symbol. */
export const OP_BY_SYMBOL = symbolOperatorMap;
