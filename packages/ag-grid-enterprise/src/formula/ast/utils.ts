import type { FormulaErrorId, FormulaErrorType } from '../i18n';
import { getFormulaErrorDefaultMessage, getFormulaErrorDefinition, interpolateFormulaErrorMessage } from '../i18n';

interface FormulaOperand {
    type: 'operand';
    value: string | number | boolean | Cell | null;
}

export interface FormulaOperation {
    type: 'operation';
    operation: string;
    operands: FormulaNode[];
}

export type FormulaNode = FormulaOperand | FormulaOperation;

const normaliseVariableValues = (values?: readonly unknown[]): string[] | undefined => {
    if (!values?.length) {
        return undefined;
    }
    return values.map((value) => String(value));
};

export class FormulaError extends Error {
    override name = 'FormulaError';
    public readonly type: FormulaErrorType;
    public readonly errorId: FormulaErrorId | null;
    public readonly localeKey: string | null;
    public readonly defaultMessage: string;
    public readonly variableValues: string[] | undefined;

    constructor(message: string, type?: FormulaErrorType);
    constructor(errorId: FormulaErrorId, variableValues?: readonly unknown[], type?: FormulaErrorType);
    constructor(
        messageOrErrorId: string | FormulaErrorId,
        typeOrVariableValues?: FormulaErrorType | readonly unknown[],
        typeOverride?: FormulaErrorType
    ) {
        const isMessage = typeof messageOrErrorId === 'string';
        const variableValues =
            !isMessage && Array.isArray(typeOrVariableValues)
                ? normaliseVariableValues(typeOrVariableValues)
                : undefined;
        const resolvedMessage = isMessage
            ? messageOrErrorId
            : getFormulaErrorDefaultMessage(messageOrErrorId, variableValues);

        super(resolvedMessage);

        if (isMessage) {
            this.type = typeof typeOrVariableValues === 'string' ? typeOrVariableValues : '#ERROR!';
            this.errorId = null;
            this.localeKey = null;
            this.defaultMessage = messageOrErrorId;
            this.variableValues = undefined;
        } else {
            const [localeKey, defaultMessage, defaultType] = getFormulaErrorDefinition(messageOrErrorId);
            this.type = typeOverride ?? defaultType ?? '#ERROR!';
            this.errorId = messageOrErrorId;
            this.localeKey = localeKey;
            this.defaultMessage = defaultMessage;
            this.variableValues = variableValues;
        }
    }

    public getTranslatedMessage(
        translate: (key: string, defaultValue: string, variableValues?: string[]) => string
    ): string {
        if (!this.localeKey) {
            return this.message;
        }
        return interpolateFormulaErrorMessage(
            translate(this.localeKey, this.defaultMessage, this.variableValues),
            this.variableValues
        );
    }
}

export class FormulaParseError extends FormulaError {
    constructor(
        errorId: FormulaErrorId,
        public readonly errorStart: number,
        public readonly errorEnd: number,
        variableValues?: readonly unknown[]
    ) {
        super(errorId, variableValues, '#PARSE!');
    }
}

// Shared cell types & guards
export type CellRef = { id: string; absolute: boolean; current?: boolean };
export type Cell = { column: CellRef; row: CellRef; endColumn?: CellRef; endRow?: CellRef };

/**
 * Walk an AST depth-first and return the first operation name for which `isValid` returns false.
 * Used by pre-evaluation validators that want to catch unsupported function names without running
 * the formula. Returns null when every operation is valid.
 */
export function findFirstInvalidOperation(node: FormulaNode, isValid: (name: string) => boolean): string | null {
    if (node.type !== 'operation') {
        return null;
    }
    if (!isValid(node.operation)) {
        return node.operation;
    }
    for (const operand of node.operands) {
        const bad = findFirstInvalidOperation(operand, isValid);
        if (bad) {
            return bad;
        }
    }
    return null;
}
