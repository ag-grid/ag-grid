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
    /** A quoted segment is one on purpose, so the value is never re-read as a single whole text. */
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

/** A list is enclosed in these, as the design draws it; no other bracket opens one. */
export const SET_LIST_OPEN_CHAR = '[';
export const SET_LIST_CLOSE_CHAR = ']';
/** Separates the path segments of one value where the column's Set Filter is a tree list. */
const SET_TREE_SEPARATOR = '›';
/** What a written path is separated by instead: no keyboard offers the drawn one, and text is retyped. */
const SET_TREE_WRITE_SEPARATOR = '>';
/** Built once: joining runs per value of a column, and neither spacing ever varies. */
const DRAWN_JOINER = ` ${SET_TREE_SEPARATOR} `;
const WRITTEN_JOINER = ` ${SET_TREE_WRITE_SEPARATOR} `;

/** How a path is drawn, in the list and wherever else one is shown. */
export const joinSetPath = (path: readonly string[]): string => path.join(DRAWN_JOINER);
/** How a path is spelled in an expression, which the author has to be able to type back. */
export const writeSetPath = (path: readonly string[]): string => path.join(WRITTEN_JOINER);

/**
 * The value list an `is any of` / `is none of` option takes. Square brackets enclose it and quoting a
 * value is optional. With a tree list one value is a whole path: `["Argentina > Sailing"]`.
 */
export class SetOperandsParser {
    private readonly values: ParsedSetValue[] = [];
    private hasOpenBracket = false;
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
    /** Where a separator with no value yet after it was read, so closing the list makes it redundant. */
    private separatorPosition = -1;
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
        } else if (!this.hasCloseBracket) {
            this.validation.reject('advancedFilterValidationMissingListEndBracket');
        }
    }

    public isComplete(): boolean {
        return this.values.length > 0 && this.hasCloseBracket;
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
            // A caret at the very start of a value is in the gap before it, so a value chosen there is
            // inserted rather than written over the one the caret is touching.
            if (position <= value.startPosition || position > value.endPosition + 1) {
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
        // The brackets say where the value ends, so a bare one may hold spaces and a `)` in it is ordinary.
        if (char === ',' || isTreeSeparator(char) || char === SET_LIST_CLOSE_CHAR) {
            this.finishSegment(position - 1, true);
            return this.parseBetweenSegments(char, position);
        }
        this.segment!.text += char;
        return undefined;
    }

    private parseBetweenSegments(char: string, position: number): boolean | undefined {
        if (!this.hasOpenBracket) {
            if (char === ' ') {
                return undefined;
            }
            if (char !== SET_LIST_OPEN_CHAR) {
                return this.validation.reject('advancedFilterValidationMissingListStartBracket', position);
            }
            this.hasOpenBracket = true;
            return undefined;
        }

        if (char === ' ') {
            return undefined;
        }

        if (char === SET_LIST_CLOSE_CHAR) {
            this.hasCloseBracket = true;
            this.closeBracketPosition = position;
            this.finishValue(position - 1, true);
            if (!this.values.length) {
                this.validation.reject('advancedFilterValidationMissingValue', position);
            } else if (this.separatorPosition >= 0) {
                (this.params.redundantSeparators ??= []).push({
                    startPosition: this.separatorPosition,
                    endPosition: position - 1,
                });
            }
            return false;
        }

        if (char === ',') {
            if (!this.value) {
                return this.validation.reject('advancedFilterValidationMissingValue', position);
            }
            this.finishValue(position - 1, true);
            this.separatorPosition = position;
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
            return this.validation.reject('advancedFilterValidationMissingListEndBracket', position);
        }

        this.startSegment(char, position);
        return undefined;
    }

    private startSegment(char: string, position: number): void {
        this.separatorPosition = -1;
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
        const advFilterSetSvc = this.params.advFilterSetSvc;
        // The segments as parsed, then the text whole, then the text re-split: quoting picks a side.
        const keys =
            advFilterSetSvc.getKeys(column, path) ??
            this.getKeysForWholeValue(value, column) ??
            this.getKeysForJoinedPath(column, path);
        value.resolved = keys !== undefined;
        // A value the column no longer holds still filters on what it says, so a data change cannot
        // silently rewrite an applied expression into a different one. The blank is named by its label,
        // there being no text that spells the blank key itself.
        const written = joinSetPath(path);
        const isBlank = path.length === 1 && written === advFilterSetSvc.getBlankLabel(column);
        value.keys = keys ?? [isBlank ? null : written];
    }

    /**
     * A bare `Arrow > Land` reads as a path first; where that names nothing, the separator was part of
     * the value. A quoted segment says the split was meant, so that second reading is not tried.
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

    /**
     * A whole path written as one value, which is the form the autocomplete produces. Read last, so a value
     * whose own text holds a separator is never taken apart on the strength of one.
     */
    private getKeysForJoinedPath(column: AgColumn, path: readonly string[]): SetFilterModelValue | undefined {
        if (path.length !== 1) {
            return undefined;
        }
        const segments = splitSetPath(path[0]);
        return segments.length > 1 ? this.params.advFilterSetSvc.getKeys(column, segments) : undefined;
    }
}

const isTreeSeparator = (char: string): boolean => char === SET_TREE_SEPARATOR || char === SET_TREE_WRITE_SEPARATOR;

/**
 * Splits a whole path written as one value, on the same characters, so quoting one does not change what
 * divides it. Spacing around a separator is how a path is spelled, not part of what it divides.
 */
export const splitSetPath = (text: string): string[] => {
    const segments: string[] = [];
    let start = 0;
    for (let i = 0, len = text.length; i < len; ++i) {
        if (isTreeSeparator(text[i])) {
            segments.push(text.slice(start, i).trim());
            start = i + 1;
        }
    }
    segments.push(text.slice(start).trim());
    return segments;
};

const isQuote = (char: string): boolean => char === `'` || char === '"';
