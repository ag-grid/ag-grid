import type { PdfTextDirection } from 'ag-grid-community';

import type { PdfGlyphDirection } from './glyphRun';

const MIRRORED_CODE_POINTS = new Map<number, number>([
    [0x0028, 0x0029],
    [0x0029, 0x0028],
    [0x003c, 0x003e],
    [0x003e, 0x003c],
    [0x005b, 0x005d],
    [0x005d, 0x005b],
    [0x007b, 0x007d],
    [0x007d, 0x007b],
    [0x00ab, 0x00bb],
    [0x00bb, 0x00ab],
    [0x2039, 0x203a],
    [0x203a, 0x2039],
    [0x2045, 0x2046],
    [0x2046, 0x2045],
    [0x207d, 0x207e],
    [0x207e, 0x207d],
    [0x208d, 0x208e],
    [0x208e, 0x208d],
    [0x2329, 0x232a],
    [0x232a, 0x2329],
    [0x3008, 0x3009],
    [0x3009, 0x3008],
    [0x300a, 0x300b],
    [0x300b, 0x300a],
    [0x300c, 0x300d],
    [0x300d, 0x300c],
    [0x300e, 0x300f],
    [0x300f, 0x300e],
    [0x3010, 0x3011],
    [0x3011, 0x3010],
    [0x3014, 0x3015],
    [0x3015, 0x3014],
    [0x3016, 0x3017],
    [0x3017, 0x3016],
    [0x3018, 0x3019],
    [0x3019, 0x3018],
    [0x301a, 0x301b],
    [0x301b, 0x301a],
    [0xfe59, 0xfe5a],
    [0xfe5a, 0xfe59],
    [0xfe5b, 0xfe5c],
    [0xfe5c, 0xfe5b],
    [0xfe5d, 0xfe5e],
    [0xfe5e, 0xfe5d],
    [0xff08, 0xff09],
    [0xff09, 0xff08],
    [0xff1c, 0xff1e],
    [0xff1e, 0xff1c],
    [0xff3b, 0xff3d],
    [0xff3d, 0xff3b],
    [0xff5b, 0xff5d],
    [0xff5d, 0xff5b],
    [0xff5f, 0xff60],
    [0xff60, 0xff5f],
    [0xff62, 0xff63],
    [0xff63, 0xff62],
]);

interface BidiCharacter {
    text: string;
    codePoint: number;
    sourceIndex: number;
    direction: PdfGlyphDirection;
}

/**
 * Resolve paragraph direction and reorder Unicode scalars for horizontal PDF layout.
 *
 * This implements the practical UAX #9 path used by exported grid text: strong
 * LTR/RTL scripts, European and Arabic-Indic numbers, combining marks, common
 * punctuation and whitespace. Explicit bidi controls are omitted from the
 * rendered output.
 */
export function resolveBidiCharacters(
    text: string,
    requestedDirection: PdfTextDirection = 'auto'
): { characters: BidiCharacter[]; direction: PdfGlyphDirection } {
    const logical = createCharacters(text);
    const direction = requestedDirection === 'auto' ? detectDirection(logical) : requestedDirection;
    const paragraphLevel = direction === 'rtl' ? 1 : 0;
    const levels = resolveLevels(logical, paragraphLevel);
    const visual = logical.filter((character) => !isBidiControl(character.codePoint));
    const visualLevels = levels.filter((_, index) => !isBidiControl(logical[index].codePoint));
    let highestLevel = paragraphLevel;
    let lowestOddLevel = Number.POSITIVE_INFINITY;

    for (const level of visualLevels) {
        highestLevel = Math.max(highestLevel, level);
        if (level % 2) {
            lowestOddLevel = Math.min(lowestOddLevel, level);
        }
    }

    if (Number.isFinite(lowestOddLevel)) {
        for (let level = highestLevel; level >= lowestOddLevel; level--) {
            let start = 0;
            while (start < visual.length) {
                while (start < visual.length && visualLevels[start] < level) {
                    start++;
                }
                let end = start;
                while (end < visual.length && visualLevels[end] >= level) {
                    end++;
                }
                reverseRange(visual, start, end);
                reverseRange(visualLevels, start, end);
                start = end;
            }
        }
    }

    restoreCombiningMarkOrder(visual, visualLevels);
    for (let index = 0; index < visual.length; index++) {
        const character = visual[index];
        const isRtl = visualLevels[index] % 2 === 1;
        character.direction = isRtl ? 'rtl' : 'ltr';
        if (isRtl) {
            const mirroredCodePoint = MIRRORED_CODE_POINTS.get(character.codePoint);
            if (mirroredCodePoint != null) {
                character.codePoint = mirroredCodePoint;
                character.text = String.fromCodePoint(mirroredCodePoint);
            }
        }
    }
    return { characters: visual, direction };
}

function restoreCombiningMarkOrder(characters: BidiCharacter[], levels: number[]): void {
    let index = 0;
    while (index < characters.length) {
        if (!isCombiningMark(characters[index].codePoint)) {
            index++;
            continue;
        }
        const markStart = index;
        while (index < characters.length && isCombiningMark(characters[index].codePoint)) {
            index++;
        }
        if (index >= characters.length) {
            break;
        }
        const marks = characters.splice(markStart, index - markStart).reverse();
        const markLevels = levels.splice(markStart, index - markStart).reverse();
        characters.splice(markStart + 1, 0, ...marks);
        levels.splice(markStart + 1, 0, ...markLevels);
        index = markStart + marks.length + 1;
    }
}

/**
 * Resolve a string into visual order. Built-in PDF fonts use this fallback
 * because they do not expose OpenType shaping tables.
 */
export function resolveVisualText(
    text: string,
    requestedDirection: PdfTextDirection = 'auto'
): { text: string; direction: PdfGlyphDirection } {
    const resolved = resolveBidiCharacters(text, requestedDirection);
    return {
        text: resolved.characters.map((character) => character.text).join(''),
        direction: resolved.direction,
    };
}

function createCharacters(text: string): BidiCharacter[] {
    const characters: BidiCharacter[] = [];
    let sourceIndex = 0;
    for (const value of text) {
        characters.push({
            text: value,
            codePoint: value.codePointAt(0) ?? 0xfffd,
            sourceIndex,
            direction: 'ltr',
        });
        sourceIndex += value.length;
    }
    return characters;
}

function detectDirection(characters: BidiCharacter[]): PdfGlyphDirection {
    for (const character of characters) {
        const type = getBidiType(character.codePoint);
        if (type === 'R' || type === 'AL') {
            return 'rtl';
        }
        if (type === 'L') {
            return 'ltr';
        }
    }
    return 'ltr';
}

function resolveLevels(characters: BidiCharacter[], paragraphLevel: number): number[] {
    const types = characters.map((character) => getBidiType(character.codePoint));
    let previousStrong: 'L' | 'R' = paragraphLevel ? 'R' : 'L';

    // NSM inherits the previous type; Arabic letters behave as R after weak resolution.
    for (let index = 0; index < types.length; index++) {
        const type = types[index];
        if (type === 'NSM') {
            types[index] = index ? types[index - 1] : previousStrong;
        } else if (type === 'AL') {
            types[index] = 'R';
            previousStrong = 'R';
        } else if (type === 'L' || type === 'R') {
            previousStrong = type;
        }
    }

    // neutrals inherit matching surrounding strong types, otherwise paragraph direction.
    for (let index = 0; index < types.length; index++) {
        if (types[index] !== 'N') {
            continue;
        }
        const before = findStrongType(types, index, -1) ?? (paragraphLevel ? 'R' : 'L');
        const after = findStrongType(types, index, 1) ?? (paragraphLevel ? 'R' : 'L');
        types[index] = before === after ? before : paragraphLevel ? 'R' : 'L';
    }

    return types.map((type) => {
        if (paragraphLevel === 0) {
            return type === 'R' ? 1 : type === 'EN' || type === 'AN' ? 2 : 0;
        }
        return type === 'L' || type === 'EN' || type === 'AN' ? 2 : 1;
    });
}

function findStrongType(types: string[], start: number, increment: -1 | 1): 'L' | 'R' | undefined {
    for (let index = start + increment; index >= 0 && index < types.length; index += increment) {
        const type = types[index];
        if (type === 'L' || type === 'R') {
            return type;
        }
        if (type === 'EN' || type === 'AN') {
            return 'L';
        }
    }
    return undefined;
}

function getBidiType(codePoint: number): 'L' | 'R' | 'AL' | 'EN' | 'AN' | 'NSM' | 'N' {
    if (isCombiningMark(codePoint)) {
        return 'NSM';
    }
    if (codePoint >= 0x0030 && codePoint <= 0x0039) {
        return 'EN';
    }
    if ((codePoint >= 0x0660 && codePoint <= 0x0669) || (codePoint >= 0x06f0 && codePoint <= 0x06f9)) {
        return 'AN';
    }
    if ((codePoint >= 0x0590 && codePoint <= 0x05ff) || (codePoint >= 0xfb1d && codePoint <= 0xfb4f)) {
        return 'R';
    }
    if (
        (codePoint >= 0x0600 && codePoint <= 0x08ff) ||
        (codePoint >= 0xfb50 && codePoint <= 0xfdff) ||
        (codePoint >= 0xfe70 && codePoint <= 0xfeff)
    ) {
        return 'AL';
    }
    if (
        (codePoint >= 0x0041 && codePoint <= 0x005a) ||
        (codePoint >= 0x0061 && codePoint <= 0x007a) ||
        (codePoint >= 0x00c0 && codePoint <= 0x02af) ||
        (codePoint >= 0x0370 && codePoint <= 0x052f) ||
        (codePoint >= 0x3040 && codePoint <= 0x30ff) ||
        (codePoint >= 0x3400 && codePoint <= 0x9fff)
    ) {
        return 'L';
    }
    return 'N';
}

function isCombiningMark(codePoint: number): boolean {
    return (
        (codePoint >= 0x0300 && codePoint <= 0x036f) ||
        (codePoint >= 0x0591 && codePoint <= 0x05c7) ||
        (codePoint >= 0x0610 && codePoint <= 0x061a) ||
        (codePoint >= 0x064b && codePoint <= 0x065f) ||
        codePoint === 0x0670 ||
        (codePoint >= 0x06d6 && codePoint <= 0x06ed)
    );
}

function isBidiControl(codePoint: number): boolean {
    return (
        codePoint === 0x061c ||
        codePoint === 0x200e ||
        codePoint === 0x200f ||
        (codePoint >= 0x202a && codePoint <= 0x202e) ||
        (codePoint >= 0x2066 && codePoint <= 0x2069)
    );
}

function reverseRange<T>(values: T[], start: number, end: number): void {
    for (let left = start, right = end - 1; left < right; left++, right--) {
        const value = values[left];
        values[left] = values[right];
        values[right] = value;
    }
}
