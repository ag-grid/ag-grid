import { AutocompleteEntry, AutocompleteListParams, AutocompleteUpdate } from "../../widgets/autocompleteParams";
import { JoinExpressionParser } from "./joinExpressionParser";
import { ExpressionParserParams } from "./expressionUtils";

export class ExpressionParser {
    private joinExpressionParser: JoinExpressionParser;
    private valid: boolean = false;

    constructor(private params: ExpressionParserParams) {}

    public parseExpression(): void {
        this.joinExpressionParser = new JoinExpressionParser(this.params, 0);
        const i = this.joinExpressionParser.parseExpression();
        this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
    }

    public isValid(): boolean {
        return this.valid;
    }

    public getExpression(): string {
        return `return ${this.joinExpressionParser.getExpression()};`;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.joinExpressionParser.getAutocompleteListParams(position);
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry): AutocompleteUpdate {
        return this.joinExpressionParser.updateExpression(position, updateEntry);
    }
}
