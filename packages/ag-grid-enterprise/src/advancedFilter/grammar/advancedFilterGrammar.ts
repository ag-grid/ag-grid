import { BaseCellDataType } from 'packages/ag-grid-community/dist/types/src/main-umd-noStyles';

import { AdvancedFilterModel, IRowNode } from 'ag-grid-community';

import { SyntaxGrammar, SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { SyntaxParserOutput, ValidSyntaxParserOutput } from '../../syntaxParser/syntaxParser';
import { ADVANCED_FILTER_LOCALE_TEXT } from '../advancedFilterLocaleText';
import {
    createBeginsWithParser,
    createContainsParser,
    createEndsWithParser,
    createEqualsParser,
    createGreaterThanOrEqualsParser,
    createGreaterThanParser,
    createLessThanOrEqualsParser,
    createLessThanParser,
    createNotContainsParser,
} from './binaryGrammarDefinition';
import { createColumnGrammar } from './columnGrammarDefinition';
import { createGroupParser } from './groupGrammarDefinition';
import { createAndParser, createOrParser } from './logicalGrammarDefinition';
import { createBooleanValueParser, createNumberValueParser, createStringValueParser } from './valueGrammarDefinition';

// prettier-ignore
export const ParserPrecedence = {
    GROUPING: 18,       // (x)
    ACCESS: 17,         // x.y
    CALL: 17,           // x(y)
    POSTFIX: 15,        // x++, x-- (Not currently used)
    PREFIX: 14,         // !x
    EXPONENT: 13,       // x ** y
    MULTIPLICATIVE: 12, // x * y, x / y, x % y
    ADDITIVE: 11,       // x + y, x - y,
    RELATIONAL: 9,      // x < y, x <= y, x > y, x >= y, x in y
    EQUALITY: 8,        // x === y, x !== y
    LOGICAL_AND: 4,     // x && y
    LOGICAL_OR: 3,      // x || y, x ?? y
    MISC: 2,            // x ? y : z
} as const

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

export type AdvancedFilterContext = {
    getColIdFromName: (name: string) => { colId: string; dataType: BaseCellDataType } | undefined;
    translate: (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) => string;
};

export type AdvancedFilterGrammarDefinition<TOutputNode extends AdvancedFilterNode> = SyntaxGrammarDefinition<
    AdvancedFilterNode,
    TOutputNode,
    AdvancedFilterContext
> & {
    filter: (
        node: TOutputNode
    ) => (row: IRowNode, context: { getCellValue: (row: IRowNode, colId: string) => any }) => boolean;
    serialize: (node: TOutputNode, context: { getColumnNameFromId: (id: string) => string }) => string;
};

export class AdvancedFilterGrammar extends SyntaxGrammar<
    AdvancedFilterNode,
    AdvancedFilterModel,
    AdvancedFilterContext
> {
    constructor() {
        super([
            createGroupParser(),
            createEqualsParser(),
            createLessThanParser(),
            createLessThanOrEqualsParser(),
            createGreaterThanParser(),
            createGreaterThanOrEqualsParser(),
            createBeginsWithParser(),
            createEndsWithParser(),
            createContainsParser(),
            createNotContainsParser(),
            createAndParser(),
            createOrParser(),
            createNumberValueParser(),
            createStringValueParser(),
            createBooleanValueParser(),
            createColumnGrammar(),
        ]);
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
