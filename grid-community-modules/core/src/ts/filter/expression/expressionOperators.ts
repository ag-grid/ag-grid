export interface Operator {
    getExpression(colValue: string, operands: string[]): string;

    getNumOperands(): number;
}

class DotOperator implements Operator {
    constructor(protected operator: string, protected numOperands: number) {}

    public getExpression(colValue: string, operands: string[]): string {
        return `${colValue}?.${this.operator}(${operands.join(', ')})`
    }

    public getNumOperands(): number {
        return this.numOperands;
    }
}

class NestedDotOperator extends DotOperator {
    public getExpression(colValue: string, operands: string[]): string {
        return super.getExpression(colValue, operands.map(operand => `${operand}?.toLocaleLowerCase()`))
    }
}

class SpaceOperator implements Operator {
    constructor(private operator: string) {}

    public getExpression(colValue: string, operands: string[]): string {
        return `${colValue} ${this.operator} ${operands[0]}`
    }

    public getNumOperands(): number {
        return 1;
    }
}

export const STRING_OPERATORS = {
    contains: new NestedDotOperator('includes', 1),
    startsWith: new NestedDotOperator('startsWith', 1)
};

export const NUMBER_OPERATORS = {
    '<': new SpaceOperator('<'),
    '>': new SpaceOperator('>')
}