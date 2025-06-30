import { AdvancedFilterModel } from 'ag-grid-community';

import { SyntaxParser } from '../../syntaxParser/syntaxParser';
import { SyntaxTokenizer } from '../../syntaxParser/syntaxTokenizer';
import { AdvancedFilterContext, AdvancedFilterGrammar, AdvancedFilterNode } from './advancedFilterGrammar';

class AdvancedFilterParser extends SyntaxParser<AdvancedFilterNode, AdvancedFilterModel, AdvancedFilterContext> {
    constructor() {
        const grammar = new AdvancedFilterGrammar();
        super(grammar, new SyntaxTokenizer(grammar.patterns), AdvancedFilterParser);
    }

    static getColIdFromName(name: string) {
        switch (name) {
            case 'boolean':
                return { colId: 'boolean', dataType: 'boolean' as const };
            case 'number':
                return { colId: 'number', dataType: 'number' as const };
            case 'date':
                return { colId: 'date', dataType: 'date' as const };
            case 'dateString':
                return { colId: 'dateString', dataType: 'dateString' as const };
            case 'text':
            default:
                return { colId: 'text', dataType: 'text' as const };
        }
    }
}

const simpleTest = () => {
    const input =
        '[boolean] == false AND [number] >= 100 OR [number] < 10 AND [text] contains "S" OR [dateString] equals "2009-1-1"';

    const parser = new AdvancedFilterParser();
    const output = parser.parse(input, 0);
    if (output.isValid) {
        console.log('Valid');
        console.log(JSON.stringify(output.model, null, 2));
    } else {
        console.log('Invalid');
        console.log(JSON.stringify(output.errors, null, 2));
    }
};

simpleTest();

// TODO: Parser refactor and expression system overhaul

// ─── Expression Terminology Update ─────────────────────────────
// - Rename Operand / Operator distinction to:
//     • ValueExpr (formerly Leaf) — literals, identifiers, constants
//     • CompoundExpr (formerly Node) — operators, functions, groups, etc.
// - All expressions should extend a common base type with datatype, tokens, and optional errors

// ─── Token Handling ────────────────────────────────────────────
// - Store original MatchedToken[] on every node for styling, rendering, and cursor tracking
// - Annotate tokens with:
//     • groupDepth
//     • synthetic?: boolean (for inserted closers)
// - Always insert closing parentheses/quotes after openers (even if already present later)
// - Mark synthetic tokens and shift token ranges forward if necessary
// - Consider adding a token rebalancer for group tracking

// ─── TokenCursor Enhancements ──────────────────────────────────
// - Rename `cursor`-related fields to `caret*`:
//     • caretPosition, caretHandled, claimCaret(), isCaretInToken()
// - Add TokenCursor helpers:
//     • clone(), peek(), consume(), isCaretInRange(), atCaret()
//     • suggestion pushing & caret claiming logic
// - Cursor should be passed into all parse functions and carry global context

// ─── Suggestions & Auto-complete ───────────────────────────────
// - Suggest only if caret is inside the current node or token
// - Cursor should propagate downward with ability to bubble back up if no suggestion claimed
// - Suggestions can be collected at any node layer; deepest wins by default

// ─── Error Handling ────────────────────────────────────────────
// - Parser should never throw; instead accumulate multiple errors:
//     • In context.errors[]
//     • Optionally node.errors[]
// - Always return a valid node, or ErrorNode with range + token(s)
// - Deepest relevant error should be surfaced to the user
// - Provide rendering metadata for highlighting error tokens
// - Create helpers: makeErrorNode(), reportError()

// ─── Rendering Strategy ────────────────────────────────────────
// - Remove buildRender() / renderString() from AST nodes
// - Instead, build a StyledToken[] array during parse for rendering
//     • Each token knows style, range, spacing, and synthetic status
// - Final render is handled in a separate renderer that converts StyledTokens to DOM

// ─── Optional Enhancements ─────────────────────────────────────
// - Track whether each group/function/etc. is synthetically closed
// - Consider debounced re-parsing for UI-friendly updates
// - Enable backtracking only when ambiguity cannot be resolved

// ─── Potential Utilities to Write ──────────────────────────────
// - disambiguateToken() for resolving ambiguous matches
// - annotateParens() for marking group depth and inserting synthetic closers
// - extractDeepestError(node) for editor display
// - TokenCursor factory with caret-aware logic
