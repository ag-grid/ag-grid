import { BaseCellDataType } from 'ag-grid-community';

import { MatchedToken, Range, Token } from './token';

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

export type ExpressionDatatype = BaseCellDataType | 'unknown';

export function isValidDatatype<TDatatypes extends readonly ExpressionDatatype[]>(
    datatype: ExpressionDatatype,
    allowed: TDatatypes
): datatype is TDatatypes[number] {
    return allowed.includes(datatype);
}

export interface ExpressionError {
    message: string;
    token?: MatchedToken;
}

type ErrorState = {
    valid: false;
    errors: ExpressionError[];
};

type NodeBase<TType extends string, TDatatype extends ExpressionDatatype, TExtras extends object = {}> = {
    type: TType;
    key: string;
    datatype: TDatatype;
    range: Range;
    tokens?: MatchedToken[];
} & (({ valid: true; errors?: undefined } & TExtras) | ErrorState);

// Use an interface here to avoid circular referencing
interface HasChildren {
    children: ExpressionNode[];
}

type NodeParent<TType extends string, TDatatype extends ExpressionDatatype, TExtras extends object = {}> = HasChildren &
    NodeBase<TType, TDatatype, TExtras>;

export type IdentifierNode<TDataType extends BaseCellDataType = BaseCellDataType, TRef = never> = NodeBase<
    'Identifier',
    TDataType,
    {
        reference: TRef;
    }
>;

export type ValueNode<TDatatype extends BaseCellDataType = BaseCellDataType, TValue = unknown> = NodeBase<
    'Value',
    TDatatype,
    {
        value: TValue;
    }
>;

export type OperandErrorNode = NodeBase<'OperandError', 'unknown'> & ErrorState;

export type OperandNode<T extends BaseCellDataType = BaseCellDataType> =
    | ValueNode<T>
    | IdentifierNode<T>
    | OperandErrorNode;

export type LogicalNode = NodeParent<
    'Logical',
    'boolean',
    {
        operands: OperandNode<'boolean'>[];
    }
>;

export type ComparatorNode<
    TParams extends Valid<DataTypedNode<BaseCellDataType>>[] = Valid<OperandNode<BaseCellDataType>>[],
> = NodeParent<
    'Comparator',
    'boolean',
    {
        parameters: TParams;
    }
>;

export type GroupNode<TDatatype extends BaseCellDataType = BaseCellDataType> = NodeParent<'Group', TDatatype>;

export type OperatorErrorNode = NodeParent<'OperatorError', 'unknown'> & ErrorState;

export type OperatorNode = LogicalNode | ComparatorNode | GroupNode | OperatorErrorNode;

export type ExpressionNode = OperandNode | OperatorNode;

export type ExpressionType = ExpressionNode['type'];

export type InferNode<TType extends ExpressionType> = Extract<ExpressionNode, { type: TType }>;

export type InferDatatype<TType extends ExpressionType> = Extract<ExpressionNode, { type: TType }>['datatype'];

export type NodeParameters<TType extends ExpressionType> =
    InferNode<TType> extends { children: ExpressionNode[] }
        ? MakeOptional<InferNode<TType>, 'valid' | 'errors' | 'children' | 'range'>
        : MakeOptional<InferNode<TType>, 'valid' | 'errors' | 'range'>;

export type DataTypedNode<TDataType extends ExpressionDatatype> = Extract<ExpressionNode, { datatype: TDataType }>;

export type Valid<TNode extends ExpressionNode> = Extract<TNode, { valid: true }>;
export type ErrorNode<TNode extends ExpressionNode> = TNode extends ParentNode ? OperandErrorNode : OperatorErrorNode;
