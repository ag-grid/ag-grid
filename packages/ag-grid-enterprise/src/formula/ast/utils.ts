import { getFormulaErrorDefaultMessage, getFormulaErrorDefinition } from '../i18n';
import type { FormulaErrorId, FormulaErrorType } from '../i18n';

interface FormulaOperand {
    type: 'operand';
    value: string | number | boolean | Cell;
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
        return translate(this.localeKey, this.defaultMessage, this.variableValues);
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
export type CellRef = { id: string; absolute: boolean };
export type Cell = { column: CellRef; row: CellRef; endColumn?: CellRef; endRow?: CellRef };
