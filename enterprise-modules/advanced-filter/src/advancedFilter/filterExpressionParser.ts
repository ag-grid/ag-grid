import { AdvancedFilterModel, AutocompleteEntry, AutocompleteListParams } from "@ag-grid-community/core";
import { JoinFilterExpressionParser } from "./joinFilterExpressionParser";
import { AutocompleteUpdate, FilterExpression, FilterExpressionFunctionParams, FilterExpressionParserParams } from "./filterExpressionUtils";

export class FilterExpressionParser {
    private joinExpressionParser: JoinFilterExpressionParser;
    private valid: boolean = false;

    constructor(private params: FilterExpressionParserParams) {}

    public parseExpression(): string {
        this.joinExpressionParser = new JoinFilterExpressionParser(this.params, 0);
        const i = this.joinExpressionParser.parseExpression();
        this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
        return this.params.expression;
    }

    public isValid(): boolean {
        return this.valid;
    }

    public getValidationMessage(): string | null {
        const error = this.joinExpressionParser.getValidationError();
        if (!error) { return null; }
        const { message, startPosition, endPosition } = error;
        return startPosition < this.params.expression.length
            ? this.params.advancedFilterExpressionService.translate('advancedFilterValidationMessage', [
                message, this.params.expression.slice(startPosition, endPosition + 1).trim()
            ])
            : this.params.advancedFilterExpressionService.translate('advancedFilterValidationMessageAtEnd', [message]);
    }

    public getFunction(): FilterExpression {
        const params: FilterExpressionFunctionParams = {
            operands: [],
            operators: [],
            evaluatorParams: []
        };
        const functionBody = `return ${this.joinExpressionParser.getFunction(params)};`;
        return {
            functionBody,
            params
        };
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.joinExpressionParser.getAutocompleteListParams(position) ?? { enabled: false };
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        return this.joinExpressionParser.updateExpression(position, updateEntry, type)!;
    }

    public getModel(): AdvancedFilterModel | null {
        return this.isValid() ? this.joinExpressionParser.getModel() : null;
    }
}
