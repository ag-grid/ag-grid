import { TokenType } from './tokenizer';
import { TokenRange } from './typeHelpers';

export type RenderToken = {
    type: TokenType;
    value: string;
    range: TokenRange;
};

export type PartialRenderToken = {
    type: TokenType;
    value: string;
};

export const joinTokens = (...tokens: ('whitespace' | PartialRenderToken | RenderToken[])[]): RenderToken[] => {
    let rendered: RenderToken[] = [];
    let pos = 0;
    for (let token of tokens) {
        if (token === 'whitespace') {
            pos++;
        } else if ('type' in token) {
            const len = token.value.length;
            rendered.push({
                ...token,
                range: {
                    start: pos,
                    end: pos + len,
                },
            });
            pos += len;
        } else {
            rendered.push(
                ...token.map(({ range, ...t }) => {
                    return { ...t, range: { start: range.start + pos, end: range.end + pos } };
                })
            );
            pos === rendered[rendered.length - 1].range.end;
        }
    }
    return rendered;
};
