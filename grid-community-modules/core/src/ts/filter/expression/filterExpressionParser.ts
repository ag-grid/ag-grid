import { AutocompleteEntry, AutocompleteListParams } from "../../widgets/autocompleteParams";
import { JoinFilterExpressionParser } from "./joinFilterExpressionParser";
import { AutocompleteUpdate, FilterExpressionParserParams } from "./filterExpressionUtils";
import { AdvancedFilterModel } from "./filterExpressionModel";

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
        return this.params.translate('filterExpressionInvalid', 'Invalid Filter Value');
    }

    public getFunction(): string {
        return `return ${this.joinExpressionParser.getFunction()};`;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.joinExpressionParser.getAutocompleteListParams(position) ?? { enabled: false };
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        return this.joinExpressionParser.updateExpression(position, updateEntry, type);
    }

    public getModel(): AdvancedFilterModel | null {
        return this.isValid() ? this.joinExpressionParser.getModel() : null;
    }
}
