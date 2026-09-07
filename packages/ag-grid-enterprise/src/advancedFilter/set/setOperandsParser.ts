import type { AgColumn, SetFilterModelValue } from 'ag-grid-community';

import type { FilterExpressionParserParams, FilterExpressionValidationError } from '../filterExpressionUtils';
import { RegionValidation } from '../filterExpressionUtils';

/** One path segment of a written value: the whole value where the column has no tree list. */
interface ParsedSegment {
    text: string;
    /** The opening quote, or the first character where the segment is unquoted. */
    startPosition: number;
    /** The closing quote, or the last character read. */
    endPosition: number;
    /** Whether a terminator was reached, rather than the segment running to the caret. */
    closed: boolean;
    /** Quoting is what says a separator is a path separator rather than part of the value. */
    quoted: boolean;
}

interface ParsedSetValue {
    segments: ParsedSegment[];
    startPosition: number;
    endPosition: number;
    /** A separator or the end bracket followed, so nothing more can be added to this value. */
    terminated: boolean;
    /** A path separator followed the last segment, so the caret sits where the next one goes. */
    expectsSegment: boolean;
    /**
     * The value was read to a close and judged. A value abandoned by a fault before that is never
     * judged, so neither a half-typed one nor one the parser gave up on is reported as naming nothing.
     */
    judged: boolean;
    /** The Set Filter keys the value filters on: the ones its path names, or the text as written. */
    keys?: SetFilterModelValue;
    /** Whether the column currently holds this value. A written value keeps filtering either way. */
    resolved: boolean;
}

/** Written lists use square brackets, as the design draws them; parentheses are read but not written. */
export const SET_LIST_OPEN_CHAR = '[';
export const SET_LIST_CLOSE_CHAR = ']';
/** Separates the path segments of one value where the column's Set Filter is a tree list. */
export const SET_TREE_SEPARATOR = '›';
/** How a path is spelled wherever one is shown or written, so the separator is spaced in one place. */
export const joinSetPath = (path: readonly string[]): string => path.join(` ${SET_TREE_SEPARATOR} `);

/**
 * The value list an `is any of` / `is none of` option takes. Either bracket and bare values are read;
 * only square brackets and quotes are written. With a tree list one value is a path: `["Argentina" › "Sailing"]`.
 */
export class SetOperandsParser {
    private readonly values: ParsedSetValue[] = [];
    private closeChar: string | undefined;
    private hasCloseBracket = false;
    /** Where the list was closed, so a caret before it is still inside the list. */
    private closeBracketPosition = -1;
    private value: ParsedSetValue | undefined;
    private segment: ParsedSegment | undefined;
    private quotes: string | undefined;
    /** A quote was read inside a quoted segment; doubling it makes it a literal, anything else ends the segment. */
    private pendingQuoteClose = false;
    /** Set once a value is read and the next character must be a separator or the end bracket. */
    private expectSeparator = false;
    private readonly validation: RegionValidation;

    constructor(
        private readonly params: FilterExpressionParserParams,
        startPosition: number,
        private readonly column: AgColumn | null | undefined
    ) {
        this.validation = new RegionValidation(params, startPosition);
    }

    public parse(char: string, position: number): boolean | undefined {
        if (this.hasCloseBracket || this.validation.isRejected()) {
            return true;
        }
        if (this.quotes) {
            return this.parseInQuotes(char, position);
        }
        if (this.segment) {
            return this.parseInSegment(char, position);
        }
        return this.parseBetweenSegments(char, position);
    }

    public complete(position: number): void {
        if (this.pendingQuoteClose) {
            // Nothing followed the quote, so it was the closing one after all. `position` is the last
            // index here, not the character after it, so the quote itself is where the segment ends.
            this.closeQuotes(position);
        } else if (this.quotes) {
            this.validation.reject('advancedFilterValidationMissingQuote');
        }
        this.finishValue(position, false);
        if (!this.values.length) {
            this.validation.reject('advancedFilterValidationMissingValue');
        } else if (this.closeChar && !this.hasCloseBracket) {
            this.validation.reject('advancedFilterValidationMissingEndBracket');
        }
    }

    public isComplete(): boolean {
        return this.values.length > 0 && (!this.closeChar || this.hasCloseBracket);
    }

    /** The Set Filter keys the list resolves to, in the order written. */
    public getKeys(): SetFilterModelValue {
        const values = this.values;
        const keys: SetFilterModelValue = [];
        for (let i = 0, len = values.length; i < len; ++i) {
            const valueKeys = values[i].keys;
            for (let j = 0, keyLen = valueKeys?.length ?? 0; j < keyLen; ++j) {
                keys.push(valueKeys![j]);
            }
        }
        return keys;
    }

    /** The keys the list already holds, so the autocomplete stops offering them. */
    public getUsedKeys(except?: ParsedSetValue): ReadonlySet<string | null> {
        const values = this.values;
        const used = new Set<string | null>();
        for (let i = 0, len = values.length; i < len; ++i) {
            const value = values[i];
            if (value !== except && value.resolved) {
                const valueKeys = value.keys!;
                for (let j = 0, keyLen = valueKeys.length; j < keyLen; ++j) {
                    used.add(valueKeys[j]);
                }
            }
        }
        return used;
    }

    public getValidationError(): FilterExpressionValidationError | null {
        const values = this.values;
        // A value naming nothing is the fault the user can act on, so it beats the region's own.
        for (let i = 0, len = values.length; i < len; ++i) {
            const value = values[i];
            if (value.judged && !value.resolved) {
                return {
                    message: this.params.advFilterExpSvc.translate('advancedFilterValidationInvalidValue'),
                    startPosition: value.startPosition,
                    endPosition: value.endPosition,
                    advisory: true,
                };
            }
        }
        return this.validation.getError();
    }

    /** The value being written at a caret position, and the segments of it that precede the caret. */
    public getValueAt(position: number): { value: ParsedSetValue; segmentIndex: number } | undefined {
        const values = this.values;
        for (let i = 0, len = values.length; i < len; ++i) {
            const value = values[i];
            if (position < value.startPosition || position > value.endPosition + 1) {
                continue;
            }
            const segments = value.segments;
            // Past a path separator the caret is where the next segment goes, not inside the last one.
            if (value.expectsSegment && position > (segments[segments.length - 1]?.endPosition ?? -1) + 1) {
                return { value, segmentIndex: segments.length };
            }
            let segmentIndex = segments.length - 1;
            for (let j = 0; j < segments.length; ++j) {
                if (position <= segments[j].endPosition + 1) {
                    segmentIndex = j;
                    break;
                }
            }
            return { value, segmentIndex };
        }
        return undefined;
    }

    /**
     * Whether the caret is still within the written list. Asked where no value holds it, so being inside
     * is what says a new value can be started there: past the last one, or in the gap between two.
     */
    public isInList(position: number): boolean {
        // A fault abandons the list where it is reported, so what follows one is no more a value than
        // what follows the close bracket. The two coincide for `[]`, where the bracket is the fault.
        const errorPosition = this.validation.getErrorPosition();
        if (errorPosition != null) {
            return position <= errorPosition;
        }
        return !this.hasCloseBracket || position <= this.closeBracketPosition;
    }

    private parseInQuotes(char: string, position: number): boolean | undefined {
        // A quote is only the end of the segment once the character after it is not the same quote, so
        // the decision waits a character: that is what lets a value hold the quote it is wrapped in.
        if (this.pendingQuoteClose) {
            this.pendingQuoteClose = false;
            if (char === this.quotes) {
                this.segment!.text += char;
                return undefined;
            }
            this.closeQuotes(position - 1);
            return this.parseBetweenSegments(char, position);
        }
        if (char === this.quotes) {
            this.pendingQuoteClose = true;
            return undefined;
        }
        this.segment!.text += char;
        return undefined;
    }

    private closeQuotes(position: number): void {
        this.pendingQuoteClose = false;
        this.quotes = undefined;
        this.finishSegment(position, true);
    }

    private parseInSegment(char: string, position: number): boolean | undefined {
        // Brackets say where the value ends, so a bare one inside them may hold spaces, and a `)` in it is
        // an ordinary character. Without them a space ends the value and a `)` is the enclosing group's.
        const endsBare = !this.closeChar && (char === ' ' || char === ')');
        if (endsBare || char === ',' || isTreeSeparator(char) || char === this.closeChar) {
            this.finishSegment(position - 1, true);
            return this.parseBetweenSegments(char, position);
        }
        this.segment!.text += char;
        return undefined;
    }

    private parseBetweenSegments(char: string, position: number): boolean | undefined {
        if (char === ' ') {
            // A space between the written parts; past the last one an unbracketed list is over.
            if (!this.expectSeparator || this.closeChar) {
                return undefined;
            }
            this.finishValue(position - 1, true);
            return true;
        }

        if (!this.closeChar && !this.values.length) {
            const closeChar = getCloseBracket(char);
            if (closeChar) {
                this.closeChar = closeChar;
                return undefined;
            }
        }

        if (char === this.closeChar) {
            this.hasCloseBracket = true;
            this.closeBracketPosition = position;
            this.finishValue(position - 1, true);
            if (!this.values.length) {
                this.validation.reject('advancedFilterValidationMissingValue', position);
            }
            return false;
        }

        if (char === ')' && !this.closeChar) {
            // The enclosing group's bracket, so the region ends on the character before it.
            this.finishValue(position - 1, true);
            if (!this.values.length) {
                this.validation.reject('advancedFilterValidationMissingValue');
            }
            return true;
        }

        if (char === ',') {
            if (!this.value) {
                return this.validation.reject('advancedFilterValidationMissingValue', position);
            }
            this.finishValue(position - 1, true);
            return undefined;
        }

        if (isTreeSeparator(char)) {
            if (!this.value) {
                return this.validation.reject('advancedFilterValidationMissingValue', position);
            }
            this.expectSeparator = false;
            this.value.expectsSegment = true;
            return undefined;
        }

        if (this.expectSeparator) {
            return this.validation.reject(
                this.closeChar ? 'advancedFilterValidationMissingEndBracket' : 'advancedFilterValidationMissingValue',
                position
            );
        }

        this.startSegment(char, position);
        return undefined;
    }

    private startSegment(char: string, position: number): void {
        if (!this.value) {
            this.value = {
                segments: [],
                startPosition: position,
                endPosition: position,
                terminated: false,
                expectsSegment: false,
                judged: false,
                resolved: false,
            };
            this.values.push(this.value);
        }
        this.value.expectsSegment = false;
        const quoted = isQuote(char);
        this.quotes = quoted ? char : undefined;
        this.segment = {
            text: quoted ? '' : char,
            startPosition: position,
            endPosition: position,
            closed: false,
            quoted,
        };
        this.value.segments.push(this.segment);
    }

    private finishSegment(position: number, closed: boolean): void {
        const segment = this.segment;
        if (!segment) {
            return;
        }
        if (!segment.quoted) {
            const text = segment.text;
            const trimmed = text.trimEnd();
            segment.text = trimmed;
            position -= text.length - trimmed.length;
        }
        segment.endPosition = position;
        segment.closed = closed;
        this.segment = undefined;
        this.value!.endPosition = position;
        this.expectSeparator = true;
    }

    /** Resolves the written path to a key; an unresolved value is what the error reports. */
    private finishValue(position: number, terminated: boolean): void {
        const value = this.value;
        if (!value) {
            return;
        }
        this.finishSegment(position, false);
        value.endPosition = Math.max(value.endPosition, Math.min(position, this.params.expression.length - 1));
        value.terminated = terminated;
        // A separator with nothing after it is still being written, whatever closed the segment before it.
        value.judged = !value.expectsSegment && (terminated || !!value.segments[value.segments.length - 1]?.closed);
        this.expectSeparator = false;
        this.value = undefined;
        const column = this.column;
        if (!column) {
            return;
        }
        const path = value.segments.map((segment) => segment.text);
        const keys = this.params.advFilterSetSvc.getKeys(column, path) ?? this.getKeysForWholeValue(value, column);
        value.resolved = keys !== undefined;
        // A value the column no longer holds still filters on what it says, so a data change cannot
        // silently rewrite an applied expression into a different one. The blank is named by its label,
        // there being no text that spells the blank key itself.
        const written = joinSetPath(path);
        const isBlank = path.length === 1 && written === this.params.advFilterSetSvc.getBlankLabel(column);
        value.keys = keys ?? [isBlank ? null : written];
    }

    /**
     * A bare `Arrow > Land` reads as a path first; where that names nothing, the separator was part of
     * the value. Quoting any segment says a path was meant, so the reading is never guessed twice.
     */
    private getKeysForWholeValue(value: ParsedSetValue, column: AgColumn): SetFilterModelValue | undefined {
        const segments = value.segments;
        if (segments.length < 2) {
            return undefined;
        }
        for (let i = 0, len = segments.length; i < len; ++i) {
            if (segments[i].quoted) {
                return undefined;
            }
        }
        // The last segment's end, not the value's: the value's is re-extended over the trailing
        // whitespace that finishing the segment trimmed off.
        const written = this.params.expression.slice(
            value.startPosition,
            segments[segments.length - 1].endPosition + 1
        );
        return this.params.advFilterSetSvc.getKeys(column, [written]);
    }
}

/**
 * The guillemet is what a path is written and drawn as; the two forms a keyboard offers are read too.
 * `/` is safe to accept because a path that names nothing is re-read as the text taken whole, which is
 * what leaves a date-like value spelling itself.
 */
const isTreeSeparator = (char: string): boolean => char === SET_TREE_SEPARATOR || char === '>' || char === '/';

const isQuote = (char: string): boolean => char === `'` || char === '"';

/** The bracket that closes a list this character opens, if it opens one. */
const getCloseBracket = (char: string): string | undefined => {
    if (char === SET_LIST_OPEN_CHAR) {
        return SET_LIST_CLOSE_CHAR;
    }
    return char === '(' ? ')' : undefined;
};
