import { SyntaxParserContext, SyntaxParserOutput, ValidSyntaxParserOutput } from './syntaxParser';
import { PatternMatch, SyntaxPattern, SyntaxToken } from './syntaxTokenizer';
import { CLOSING_CATEGORIES, KindOf, NodeOf, OPENING_CATEGORIES, SyntaxConfig } from './syntaxTypes';

function typedValues<T extends Record<string, any>>(obj: T): Array<T[keyof T]> {
    return Object.values(obj) as Array<T[keyof T]>;
}

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

export type SyntaxParselet<TKind extends string, TModel, TOutputModel extends TModel, TContext> = ParseletTypes & {
    parse(
        context: TContext,
        token: SyntaxToken<TKind>,
        left?: ValidSyntaxParserOutput<TModel>
    ): SyntaxParserOutput<TOutputModel>;
};

export interface SyntaxGrammarDefinition<
    TParselet extends SyntaxParselet<infer TKind, infer TModel, infer TOutputModel, infer TContext>,
> {
    parselet: TParselet;
    patterns: SyntaxPattern<KindOf<TSyntaxConfig>>[];
}

export abstract class SyntaxGrammar<TSyntaxConfig extends SyntaxConfig, TContext> {
    private _patterns: SyntaxPattern<KindOf<TSyntaxConfig>>[];

    constructor(
        private defs: {
            [TKind in KindOf<TSyntaxConfig>]: SyntaxGrammarDefinition<TSyntaxConfig, TKind, TContext>;
        }
    ) {
        this._patterns = typedValues(defs).flatMap((def) => def.patterns);
    }

    get patterns() {
        return this._patterns;
    }

    parselet<TKind extends KindOf<TSyntaxConfig>>(kind: TKind): SyntaxParselet<TSyntaxConfig, TKind, TContext> {
        return this.defs[kind].parselet;
    }

    isClosingToken(matches: PatternMatch<KindOf<TSyntaxConfig>>[]): boolean {
        return matches.some((m) => CLOSING_CATEGORIES.has(m.category));
    }

    isOpeningToken(matches: PatternMatch<KindOf<TSyntaxConfig>>[]): boolean {
        return matches.some((m) => OPENING_CATEGORIES.has(m.category));
    }

    abstract validateOutput(
        output: ValidSyntaxParserOutput<TSyntaxConfig['model']>
    ): SyntaxParserOutput<TSyntaxConfig['model']>;
}
