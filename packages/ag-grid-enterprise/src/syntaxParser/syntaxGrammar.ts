import { SyntaxParserContext, SyntaxParserOutput, ValidSyntaxParserOutput } from './syntaxParser';
import { PatternMatch, SyntaxPattern } from './syntaxTokenizer';
import { CLOSING_CATEGORIES, OPENING_CATEGORIES } from './syntaxTypes';

type ParseletTypes =
    | {
          type: 'operand';
      }
    | {
          type: 'operator';
          fixity: 'prefix' | 'postfix';
          precedence: number;
      }
    | {
          type: 'operator';
          fixity: 'infix';
          associativity: 'left' | 'right';
          precedence: number;
      };

export type SyntaxParselet<TModelNode, TOutputNode extends TModelNode, TContext = {}> = ParseletTypes & {
    parse(
        context: SyntaxParserContext<TModelNode, TContext>,
        left?: ValidSyntaxParserOutput<TModelNode>
    ): SyntaxParserOutput<TOutputNode>;
};

export interface SyntaxGrammarDefinition<TModelNode, TOutputNode extends TModelNode, TContext> {
    key: string;
    patterns: SyntaxPattern[];
    parselet: SyntaxParselet<TModelNode, TOutputNode, TContext>;
}

export abstract class SyntaxGrammar<TModelNode, TOutputNode extends TModelNode, TContext> {
    private _patterns: SyntaxPattern[] = [];
    private _parselets: Map<string, SyntaxParselet<TModelNode, TModelNode, TContext>> = new Map();

    constructor(defs: SyntaxGrammarDefinition<TModelNode, TModelNode, TContext>[]) {
        defs.forEach((def) => {
            this._patterns.push(...def.patterns);
            this._parselets.set(def.key, def.parselet);
        });
    }

    get patterns() {
        return this._patterns;
    }

    getParselet(matches: PatternMatch[]): SyntaxParselet<TModelNode, TModelNode, TContext> | null {
        for (let key of matches.map((m) => m.key)) {
            const parser = this._parselets.get(key);
            if (parser) return parser as SyntaxParselet<TModelNode, TModelNode, TContext>;
        }
        return null;
    }

    isClosingToken(matches: PatternMatch[]): boolean {
        return matches.some((m) => CLOSING_CATEGORIES.has(m.category));
    }

    isOpeningToken(matches: PatternMatch[]): boolean {
        return matches.some((m) => OPENING_CATEGORIES.has(m.category));
    }

    abstract validateOutput(output: ValidSyntaxParserOutput<TModelNode>): SyntaxParserOutput<TOutputNode>;
}
