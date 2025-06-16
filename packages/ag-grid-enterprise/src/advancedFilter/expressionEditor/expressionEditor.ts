import { AdvancedFilterExpressionLexer } from './expressionLexer';
import { AdvancedFilterExpressionParser } from './expressionParser';

export class AdvancedFilterExpressionEditor {
    lexer: AdvancedFilterExpressionLexer;
    parser: AdvancedFilterExpressionParser;
    constructor() {
        this.lexer = new AdvancedFilterExpressionLexer();
        this.parser = new AdvancedFilterExpressionParser();

        // this.lexer.setMatchers()
    }
}
