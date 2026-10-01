import { decodeSearchString } from './live';

/** Helpers for reading WAFv2 rule statements. */

export type Leaf =
    | { kind: 'byte'; field: string; value: string; positional: string; transforms: string[] }
    | { kind: 'regex'; field: string; value: string; transforms: string[] }
    | { kind: 'label'; value: string; scope: string }
    | { kind: 'ipset'; value: string };

function fieldName(ftm: any): string {
    if (!ftm) {
        return '';
    }
    if (ftm.SingleHeader) {
        return `header:${String(ftm.SingleHeader.Name).toLowerCase()}`;
    }
    return Object.keys(ftm)[0] ?? '';
}

const transforms = (s: any): string[] =>
    [...(s.TextTransformations ?? [])].sort((a: any, b: any) => a.Priority - b.Priority).map((t: any) => t.Type);

// ---- boolean structure ---------------------------------------------------------------------
// leaves() flattens a statement and so forgets AND / OR / NOT: a removed negation or an AND turned
// into an OR keeps every leaf. These read a statement only in the shape a check requires, and
// return undefined for any other shape, so a check can fail on structure as well as on values.

const LEAF_STATEMENTS = new Set([
    'ByteMatchStatement',
    'RegexMatchStatement',
    'LabelMatchStatement',
    'IPSetReferenceStatement',
]);

/** The statement's leaf, when it is a single match statement (byte, regex, label, IP set). */
export function leafOf(stmt: any): Leaf | undefined {
    if (!stmt || typeof stmt !== 'object' || stmt.AndStatement || stmt.OrStatement || stmt.NotStatement) {
        return undefined;
    }
    const keys = Object.keys(stmt);
    if (keys.length !== 1 || !LEAF_STATEMENTS.has(keys[0])) {
        return undefined;
    }
    return leaves(stmt)[0];
}

/** The children of an AndStatement, or undefined for any other statement. */
export const andOf = (stmt: any): any[] | undefined =>
    Array.isArray(stmt?.AndStatement?.Statements) ? stmt.AndStatement.Statements : undefined;

/** The statement a NotStatement negates, or undefined for any other statement. */
export const notOf = (stmt: any): any | undefined => stmt?.NotStatement?.Statement;

/** The children of an AND, each a single leaf; undefined if it is not an AND of leaves. */
export function andOfLeaves(stmt: any): Leaf[] | undefined {
    return leavesOfEach(andOf(stmt));
}

/**
 * The alternatives of an OR of leaves, or of a single leaf (WAF needs two statements for an OR,
 * so a one-item list is written as the leaf itself). Undefined for any other shape.
 */
export function anyOfLeaves(stmt: any): Leaf[] | undefined {
    const single = leafOf(stmt);
    if (single) {
        return [single];
    }
    return Array.isArray(stmt?.OrStatement?.Statements) ? leavesOfEach(stmt.OrStatement.Statements) : undefined;
}

/** NOT(any of leaves): the exemption shape. Undefined unless the statement is that negation. */
export function noneOfLeaves(stmt: any): Leaf[] | undefined {
    const inner = notOf(stmt);
    return inner === undefined ? undefined : anyOfLeaves(inner);
}

/**
 * NOT(any of: a leaf, or an AND of leaves): p11's exemption shape, where one alternative needs two
 * conditions at once (the saliencebot UA from the salience-bot IP set). Single-leaf alternatives
 * come back in `leaves`, AND alternatives in `ands`. Undefined for any other shape.
 */
export function noneOfAlternatives(stmt: any): { leaves: Leaf[]; ands: Leaf[][] } | undefined {
    const inner = notOf(stmt);
    if (inner === undefined) {
        return undefined;
    }
    const single = leafOf(inner);
    if (single) {
        return { leaves: [single], ands: [] };
    }
    const alternatives: any[] | undefined = inner?.OrStatement?.Statements;
    if (!Array.isArray(alternatives)) {
        return undefined;
    }
    const out = { leaves: [] as Leaf[], ands: [] as Leaf[][] };
    for (const alt of alternatives) {
        const leaf = leafOf(alt);
        const and = leaf ? undefined : andOfLeaves(alt);
        if (leaf) {
            out.leaves.push(leaf);
        } else if (and) {
            out.ands.push(and);
        } else {
            return undefined;
        }
    }
    return out;
}

function leavesOfEach(list: any[] | undefined): Leaf[] | undefined {
    if (!list) {
        return undefined;
    }
    const out = list.map(leafOf);
    return out.every((l): l is Leaf => l !== undefined) ? out : undefined;
}

/** Every matching leaf in a statement tree, in document order. Search strings are decoded. */
export function leaves(node: unknown): Leaf[] {
    const out: Leaf[] = [];
    const walk = (n: unknown): void => {
        if (Array.isArray(n)) {
            n.forEach(walk);
            return;
        }
        if (!n || typeof n !== 'object') {
            return;
        }
        const o = n as Record<string, any>;
        if (o.ByteMatchStatement) {
            const s = o.ByteMatchStatement;
            out.push({
                kind: 'byte',
                field: fieldName(s.FieldToMatch),
                value: decodeSearchString(s.SearchString),
                positional: s.PositionalConstraint,
                transforms: transforms(s),
            });
        } else if (o.RegexMatchStatement) {
            const s = o.RegexMatchStatement;
            out.push({
                kind: 'regex',
                field: fieldName(s.FieldToMatch),
                value: s.RegexString,
                transforms: transforms(s),
            });
        } else if (o.LabelMatchStatement) {
            out.push({ kind: 'label', value: o.LabelMatchStatement.Key, scope: o.LabelMatchStatement.Scope });
        } else if (o.IPSetReferenceStatement) {
            out.push({ kind: 'ipset', value: o.IPSetReferenceStatement.ARN });
        } else {
            Object.values(o).forEach(walk);
        }
    };
    walk(node);
    return out;
}

export function ruleAction(rule: any): string {
    const a = rule.Action ?? rule.OverrideAction ?? {};
    return Object.keys(a)[0] ?? '';
}

export function applyTransforms(value: string, types: string[]): string {
    let v = value;
    for (const t of types) {
        if (t === 'LOWERCASE') {
            v = v.toLowerCase();
        } else if (t === 'URL_DECODE') {
            try {
                v = decodeURIComponent(v);
            } catch {
                // leave undecodable input as-is, as WAF does
            }
        }
    }
    return v;
}

/** Evaluates a WAF regex leaf against a value the way WAF would (transforms first). */
export function regexLeafMatches(leaf: Extract<Leaf, { kind: 'regex' }>, value: string): boolean {
    return new RegExp(leaf.value).test(applyTransforms(value, leaf.transforms));
}

export function byteLeafMatches(leaf: Extract<Leaf, { kind: 'byte' }>, value: string): boolean {
    const v = applyTransforms(value, leaf.transforms);
    switch (leaf.positional) {
        case 'EXACTLY':
            return v === leaf.value;
        case 'STARTS_WITH':
            return v.startsWith(leaf.value);
        case 'ENDS_WITH':
            return v.endsWith(leaf.value);
        case 'CONTAINS':
            return v.includes(leaf.value);
        default:
            return false;
    }
}

/** True when any UriPath leaf (byte or regex) in the list matches the path. */
export function anyPathLeafMatches(list: Leaf[], path: string): boolean {
    return list.some((l) =>
        l.kind === 'regex' && l.field === 'UriPath'
            ? regexLeafMatches(l, path)
            : l.kind === 'byte' && l.field === 'UriPath'
              ? byteLeafMatches(l, path)
              : false
    );
}
