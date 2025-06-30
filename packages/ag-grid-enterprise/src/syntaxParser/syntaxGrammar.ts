import { SyntaxParserContext, SyntaxParserOutput, ValidSyntaxParserOutput } from './syntaxParser';
import { PatternMatch, SyntaxPattern } from './syntaxTokenizer';
import { CLOSING_CATEGORIES, OPENING_CATEGORIES } from './syntaxTypes';

export interface SyntaxParselet<TModelNode, TOutputNode extends TModelNode> {
    isLeading: boolean;
    expectsLeft: boolean;
    shouldParseAt(precedence: number): boolean;
    parse(
        context: SyntaxParserContext<TModelNode>,
        left?: ValidSyntaxParserOutput<TModelNode>
    ): SyntaxParserOutput<TOutputNode>;
}

export interface SyntaxGrammarDefinition<TModelNode, TOutputNode extends TModelNode> {
    key: string;
    patterns: SyntaxPattern[];
    parselet: SyntaxParselet<TModelNode, TOutputNode>;
}

export abstract class SyntaxGrammar<TModelNode, TOutputNode extends TModelNode> {
    private patterns: SyntaxPattern[];
    private parselets: Map<string, SyntaxParselet<TModelNode, TModelNode>>;

    constructor(defs: SyntaxGrammarDefinition<TModelNode, TModelNode>[]) {
        defs.forEach((def) => {
            this.patterns.push(...def.patterns);
            this.parselets.set(def.key, def.parselet);
        });
    }

    getPatterns() {
        return this.patterns;
    }

    getParser(matches: PatternMatch[]): SyntaxParselet<TModelNode, TModelNode> | null {
        for (let key of matches.map((m) => m.key)) {
            const parser = this.parselets.get(key);
            if (parser) return parser;
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
