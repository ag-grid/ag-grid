import { IRowNode } from 'ag-grid-community';

import { ExpressionDataType, ExpressionDefinition, ModelNode, ParsedExpression, ParserPrecedence } from '../model';
import { joinTokens } from '../renderer';

const BETWEEN_EXPRESSION_KEY = "BetweenExpression"
const BETWEEN_TOKEN_KEY = "BetweenToken"
const BETWEEN_AND_TOKEN_KEY = "BetweenAndToken"

export type BetweenExpressionNode<TDataType extends 'number' | 'date' = "number" | "date"> = ModelNode<'boolean'> & {
    key: typeof BETWEEN_EXPRESSION_KEY;
    value: ModelNode<TDataType>;
    min: ModelNode<TDataType>;
    max: ModelNode<TDataType>;
};

export function isExpectedNode<TDataType extends ExpressionDataType>(node: unknown, key: string, dataTypes: TDataType[]): node is ModelNode<TDataType> {
    return node !== null 
        && typeof node === "object" 
        && "key" in node
        && typeof node.key === "string" 
        && node.key === key
        && "dataType" in node 
        && typeof node.dataType === "string" 
        && !(dataTypes as string[]).includes(node.dataType);
} 

export const BetweenExpressionDefinition: ExpressionDefinition<BetweenExpressionNode> = {
    key: BETWEEN_EXPRESSION_KEY,
    tokenMatchers: [{
        type: 'string',
        token: "COMPARATOR",
        key: BETWEEN_TOKEN_KEY,
        label: "BETWEEN"
    }, {
        type: 'string',
        token: "STRUCTURAL",
        key: BETWEEN_AND_TOKEN_KEY,
        label: "BETWEEN"
    }],
    fixity: 'infix',
    associativity: 'left',
    precedence: ParserPrecedence.RELATIONAL,

    parseFromCursor: (value, cursor, context) => {
        let expression: ParsedExpression<BetweenExpressionNode> = {
            errors: value.errors,
            tokens: value.tokens
        }

        let valid = !!value.model

        const betweenOp = cursor.expect("COMPARATOR", BETWEEN_TOKEN_KEY);

        if (!betweenOp) {
            valid = false;
        }
        else {
            expression.tokens.push(betweenOp);
        }

        const min = context.parseFromCursor(cursor, ParserPrecedence.RELATIONAL);

        expression.tokens.push(...min.tokens);
        if (!min.model) {
            valid = false;
            expression.errors.push(...min.errors);
        }

        const andOp = cursor.expect("STRUCTURAL", BETWEEN_AND_TOKEN_KEY); 

        if (!andOp) {
            valid = false;
        }
        else {
            expression.tokens.push(andOp);
        }

        const max = context.parseFromCursor(cursor, ParserPrecedence.RELATIONAL);

        expression.tokens.push(...max.tokens);
        if (!min.model) {
            valid = false;
            expression.errors.push(...min.errors);
        }

        if (value.model?.dataType !== "number" && value.model?.dataType !== "date") {
            valid = false
        }

        if (value.model?.dataType !== min.model?.dataType || value.model?.dataType !== max.model?.dataType) {
            valid === false;
        }
        
        if (valid) {
            expression.model = {
                value: value.model,
                min:  min.model, 
                max: max.model
            }
        }

        return expression;
    },
    parseFromModel: (node, context) => {
        if (!isExpectedNode(node, BETWEEN_EXPRESSION_KEY, ["number", "date"])) {
            return {
                errors: [{message: "Couldn't parse provided node"}]
            };
        }

        if ()

        const min = context.parseFromModel(node.min)

    



        return node;
    },
    getEvaluator: (node, context) => {
        const getValue = context.getEvaluator(node.value);
        const getMin = context.getEvaluator(node.min);
        const getMax = context.getEvaluator(node.max);

        return (row: IRowNode) => {
            let value = getValue(row);
            return getMin(row) <= value && value <= getMax(row);
        };
    },
    getSuggestions: (node, context) => {
        return Promise.resolve([]);
    },
    toFormattedTokens: (node, context) => {
        return joinTokens(
            context.toDisplayTokens(node.value),
            'whitespace',
            { type: "COMPARATOR", value: "BETWEEN" },
            'whitespace',
            context.toDisplayTokens(node.min),
            'whitespace',
            { type: "COMPARATOR", value: "AND" },
            'whitespace',
            context.toDisplayTokens(node.max),
        )
    }
};
