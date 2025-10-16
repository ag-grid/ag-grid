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

export class FormulaError extends Error {
    override name = 'FormulaError';
    constructor(
        message: string,
        public readonly type:
            | '#REF!'
            | '#NAME?'
            | '#CIRCREF!'
            | '#PARSE!'
            | '#VALUE!'
            | '#DIV/0!'
            | '#ERROR!' = '#ERROR!'
    ) {
        super(message);
    }
}

export class FormulaParseError extends FormulaError {
    constructor(
        message: string,
        public readonly errorStart: number,
        public readonly errorEnd: number
    ) {
        super(message, '#PARSE!');
    }
}

// Shared cell types & guards
export type CellRef = { id: string; absolute: boolean };
export type Cell = { column: CellRef; row: CellRef; endColumn?: CellRef; endRow?: CellRef };
