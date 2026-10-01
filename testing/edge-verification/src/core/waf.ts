import { decodeSearchString } from './live';

/** Helpers for reading WAFv2 rule statements. */

export type Leaf =
    | { kind: 'byte'; field: string; value: string; positional: string; transforms: string[] }
    | { kind: 'regex'; field: string; value: string; transforms: string[] }
    | { kind: 'label'; value: string }
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
            out.push({ kind: 'label', value: o.LabelMatchStatement.Key });
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
