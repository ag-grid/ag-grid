import { AutocompleteEntry, AutocompleteListParams } from "../../widgets/autocompleteParams";
import { JoinFilterExpressionParser } from "./joinFilterExpressionParser";
import { AutocompleteUpdate, FilterExpressionParserParams } from "./filterExpressionUtils";

export class FilterExpressionParser {
    private joinExpressionParser: JoinFilterExpressionParser;
    private valid: boolean = false;

    constructor(private params: FilterExpressionParserParams) {}

    public parseExpression(): void {
        this.joinExpressionParser = new JoinFilterExpressionParser(this.params, 0);
        const i = this.joinExpressionParser.parseExpression();
        this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
    }

    public isValid(): boolean {
        return this.valid;
    }

    public getValidationMessage(): string | null {
        return this.joinExpressionParser.getValidationMessage();
    }

    public getExpression(): string {
        return `return ${this.joinExpressionParser.getExpression()};`;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.joinExpressionParser.getAutocompleteListParams(position);
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        return this.joinExpressionParser.updateExpression(position, updateEntry, type);
    }
}
