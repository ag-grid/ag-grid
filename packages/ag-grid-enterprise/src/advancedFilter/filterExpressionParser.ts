import type { AdvancedFilterModel } from 'ag-grid-community';

import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import type {
    AutocompleteUpdate,
    FilterExpressionFunction,
    FilterExpressionFunctionParams,
    FilterExpressionParserParams,
} from './filterExpressionUtils';
import { applyExpressionRewrites } from './filterExpressionUtils';
import { JoinFilterExpressionParser } from './joinFilterExpressionParser';

export class FilterExpressionParser {
    private joinExpressionParser: JoinFilterExpressionParser;
    private valid: boolean = false;

    constructor(private readonly params: FilterExpressionParserParams) {}

    /** Positions are recorded against the text as parsed, so a caller showing the returned text must re-parse it. */
    public parseExpression(): string {
        this.joinExpressionParser = new JoinFilterExpressionParser(this.params, 0);
        const i = this.joinExpressionParser.parseExpression();
        this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
        return applyExpressionRewrites(this.params);
    }

    public isValid(): boolean {
        return this.valid;
    }

    public getValidationMessage(): string | null {
        const error = this.joinExpressionParser.getValidationError();
        if (!error) {
            return null;
        }
        const { expression, advFilterExpSvc } = this.params;
        if (error.startPosition >= expression.length) {
            return advFilterExpSvc.translate('advancedFilterValidationMessageAtEnd', [error.message]);
        }
        return advFilterExpSvc.translate('advancedFilterValidationMessage', [
            error.message,
            expression.slice(error.startPosition, error.endPosition + 1).trim(),
        ]);
    }

    public getFunction(): {
        expressionFunction: FilterExpressionFunction;
        params: FilterExpressionFunctionParams;
    } {
        const params = this.createFunctionParams();
        return {
            expressionFunction: this.joinExpressionParser.getFunction(params),
            params,
        };
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.joinExpressionParser.getAutocompleteListParams(position) ?? { enabled: false };
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        return this.joinExpressionParser.updateExpression(position, updateEntry, type)!;
    }

    public getModel(forBuilder?: boolean): AdvancedFilterModel | null {
        return this.isValid() ? this.joinExpressionParser.getModel(forBuilder) : null;
    }

    private createFunctionParams(): FilterExpressionFunctionParams {
        return {
            operands: [],
            operators: [],
            evaluatorParams: [],
        };
    }
}
