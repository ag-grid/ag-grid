import { BaseCellDataType } from 'packages/ag-grid-community/dist/types/src/main-umd-noStyles';

import { AdvancedFilterModel } from 'ag-grid-community';

import { SyntaxGrammar } from '../../syntaxParser/syntaxGrammar';
import { SyntaxParserOutput, ValidSyntaxParserOutput } from '../../syntaxParser/syntaxParser';
import { createEqualsParser } from './binaryGrammarDefinition';

export type TextValueNode = {
    type: 'value';
    dataType: 'text';
    value: string;
};

export type NumberValueNode = {
    type: 'value';
    dataType: 'number';
    value: number;
};

export type BooleanValueNode = {
    type: 'value';
    dataType: 'boolean';
    value: boolean;
};

export type ValueNode = TextValueNode | NumberValueNode | BooleanValueNode;

export type ColumnNode = {
    type: 'column';
    dataType: BaseCellDataType;
    colId: string;
};

export type AdvancedFilterNode = AdvancedFilterModel | ValueNode | ColumnNode;

export class AdvancedFilterGrammar extends SyntaxGrammar<AdvancedFilterNode, AdvancedFilterModel> {
    constructor() {
        super([createEqualsParser()]);
    }

    override validateOutput(
        output: ValidSyntaxParserOutput<AdvancedFilterNode>
    ): SyntaxParserOutput<AdvancedFilterModel> {
        if (output.model.type === 'column' || output.model.type === 'value') {
            return {
                isValid: false,
                errors: [],
                tokens: output.tokens,
            };
        }
        return output as SyntaxParserOutput<AdvancedFilterModel>;
    }
}
