import type { PdfTextDirection } from 'ag-grid-community';

import type { PdfGlyphRun, PdfShapedGlyph } from '../glyphRun';
import { resolveBidiCharacters } from '../textDirection';
import type { TrueTypeFont } from '../ttf';

type Glyph = PdfShapedGlyph & { codePoint: number };
type LookupFilter = (glyph: Glyph) => boolean;

const ARABIC_FEATURES = ['isol', 'fina', 'medi', 'init'] as const;
const COMMON_SUBSTITUTION_FEATURES = ['ccmp', 'locl', 'rlig', 'calt', 'liga'] as const;
const POSITIONING_FEATURES = ['kern', 'curs', 'mark', 'mkmk'] as const;
const ARABIC_SCRIPT_LANGUAGES = new Set(['ar', 'fa', 'ps', 'sd', 'ug', 'ur']);

/**
 * Shape logical Unicode text with the OpenType tables in a registered TrueType font.
 */
export function shapeTrueTypeText(
    text: string,
    font: TrueTypeFont,
    direction: PdfTextDirection,
    language?: string
): PdfGlyphRun {
    const shapingText = text.normalize('NFC');
    const logicalCharacters = createLogicalCharacters(shapingText);
    const script = detectOpenTypeScript(logicalCharacters, language);
    const bidi = resolveBidiCharacters(shapingText, direction);
    const visualCharacterBySourceIndex = new Map<number, (typeof bidi.characters)[number]>();
    for (const character of bidi.characters) {
        visualCharacterBySourceIndex.set(character.sourceIndex, character);
    }
    let glyphs: Glyph[] = [];
    for (const character of logicalCharacters) {
        const visualCharacter = visualCharacterBySourceIndex.get(character.sourceIndex);
        if (!visualCharacter) {
            continue;
        }
        const glyphId = font.getGlyphId(visualCharacter.codePoint);
        glyphs.push({
            glyphId,
            codePoint: character.codePoint,
            cluster: character.sourceIndex,
            unicode: character.text,
            xAdvance: font.getAdvanceWidth(glyphId),
            yAdvance: 0,
            xOffset: 0,
            yOffset: 0,
        });
    }

    const gsub = font.getTable('GSUB');
    if (gsub) {
        for (const feature of COMMON_SUBSTITUTION_FEATURES.slice(0, 2)) {
            glyphs = applyGsubFeatureSafely(gsub, glyphs, script, language, feature);
        }
        if (script === 'arab') {
            const joiningFeatures = resolveArabicJoiningFeatures(logicalCharacters);
            for (const feature of ARABIC_FEATURES) {
                glyphs = applyGsubFeatureSafely(
                    gsub,
                    glyphs,
                    script,
                    language,
                    feature,
                    (glyph) => joiningFeatures.get(glyph.cluster) === feature
                );
            }
        }
        for (const feature of COMMON_SUBSTITUTION_FEATURES.slice(2)) {
            glyphs = applyGsubFeatureSafely(gsub, glyphs, script, language, feature);
        }
    }

    for (const glyph of glyphs) {
        glyph.xAdvance = font.getAdvanceWidth(glyph.glyphId);
    }

    const gpos = font.getTable('GPOS');
    if (gpos) {
        for (const feature of POSITIONING_FEATURES) {
            glyphs = applyGposFeatureSafely(gpos, glyphs, script, language, feature);
        }
    }

    // GSUB runs in logical order. Reorder complete shaped clusters only after
    // substitutions so contextual Arabic lookups see their logical neighbours.
    const visualRank = new Map<number, number>();
    for (let index = 0; index < bidi.characters.length; index++) {
        visualRank.set(bidi.characters[index].sourceIndex, index);
    }
    glyphs.sort((left, right) => {
        const leftRank = visualRank.get(left.cluster) ?? left.cluster;
        const rightRank = visualRank.get(right.cluster) ?? right.cluster;
        return leftRank - rightRank;
    });

    return {
        direction: bidi.direction,
        glyphs: glyphs.map(({ codePoint: _codePoint, ...glyph }) => glyph),
    };
}

function applyGsubFeatureSafely(
    table: Uint8Array,
    glyphs: Glyph[],
    script: string,
    language: string | undefined,
    feature: string,
    filter?: LookupFilter
): Glyph[] {
    const reader = new OpenTypeReader(table);
    const lookupOffsets = getFeatureLookupOffsets(reader, script, language, feature);
    if (!lookupOffsets.length) {
        return glyphs;
    }

    const fallback = cloneGlyphs(glyphs);
    try {
        for (const lookupOffset of lookupOffsets) {
            glyphs = applySubstitutionLookup(reader, lookupOffset, glyphs, filter);
        }
        return glyphs;
    } catch {
        return fallback;
    }
}

function applyGposFeatureSafely(
    table: Uint8Array,
    glyphs: Glyph[],
    script: string,
    language: string | undefined,
    feature: string
): Glyph[] {
    const reader = new OpenTypeReader(table);
    const lookupOffsets = getFeatureLookupOffsets(reader, script, language, feature);
    if (!lookupOffsets.length) {
        return glyphs;
    }

    const positionedGlyphs = cloneGlyphs(glyphs);
    try {
        applyGposLookups(reader, lookupOffsets, positionedGlyphs);
        return positionedGlyphs;
    } catch {
        return glyphs;
    }
}

function cloneGlyphs(glyphs: Glyph[]): Glyph[] {
    return glyphs.map((glyph) => ({ ...glyph }));
}

function applySubstitutionLookup(
    reader: OpenTypeReader,
    lookupOffset: number,
    glyphs: Glyph[],
    filter?: LookupFilter
): Glyph[] {
    const lookupType = reader.u16(lookupOffset);
    const subtableCount = reader.u16(lookupOffset + 4);
    for (let subtableIndex = 0; subtableIndex < subtableCount; subtableIndex++) {
        const subtableOffset = lookupOffset + reader.u16(lookupOffset + 6 + subtableIndex * 2);
        if (lookupType === 1) {
            applySingleSubstitution(reader, subtableOffset, glyphs, filter);
        } else if (lookupType === 2) {
            glyphs = applyMultipleSubstitution(reader, subtableOffset, glyphs, filter);
        } else if (lookupType === 4) {
            glyphs = applyLigatureSubstitution(reader, subtableOffset, glyphs, filter);
        } else if (lookupType === 5) {
            glyphs = applyContextSubstitution(reader, subtableOffset, glyphs);
        } else if (lookupType === 6) {
            glyphs = applyChainedContextSubstitution(reader, subtableOffset, glyphs);
        } else if (lookupType === 7 && reader.u16(subtableOffset) === 1) {
            const extensionType = reader.u16(subtableOffset + 2);
            const extensionOffset = subtableOffset + reader.u32(subtableOffset + 4);
            if (extensionType === 1) {
                applySingleSubstitution(reader, extensionOffset, glyphs, filter);
            } else if (extensionType === 2) {
                glyphs = applyMultipleSubstitution(reader, extensionOffset, glyphs, filter);
            } else if (extensionType === 4) {
                glyphs = applyLigatureSubstitution(reader, extensionOffset, glyphs, filter);
            } else if (extensionType === 5) {
                glyphs = applyContextSubstitution(reader, extensionOffset, glyphs);
            } else if (extensionType === 6) {
                glyphs = applyChainedContextSubstitution(reader, extensionOffset, glyphs);
            }
        }
    }
    return glyphs;
}

function applyContextSubstitution(reader: OpenTypeReader, offset: number, glyphs: Glyph[]): Glyph[] {
    if (reader.u16(offset) !== 3) {
        return glyphs;
    }
    const glyphCount = reader.u16(offset + 2);
    const substitutionCount = reader.u16(offset + 4);
    const coverageOffsets: number[] = [];
    for (let index = 0; index < glyphCount; index++) {
        coverageOffsets.push(offset + reader.u16(offset + 6 + index * 2));
    }
    const recordsOffset = offset + 6 + glyphCount * 2;
    return applyContextRecords(reader, glyphs, coverageOffsets, [], [], recordsOffset, substitutionCount);
}

function applyChainedContextSubstitution(reader: OpenTypeReader, offset: number, glyphs: Glyph[]): Glyph[] {
    if (reader.u16(offset) !== 3) {
        return glyphs;
    }
    let cursor = offset + 2;
    const backtrackCount = reader.u16(cursor);
    cursor += 2;
    const backtrack: number[] = [];
    for (let index = 0; index < backtrackCount; index++, cursor += 2) {
        backtrack.push(offset + reader.u16(cursor));
    }
    const inputCount = reader.u16(cursor);
    cursor += 2;
    const input: number[] = [];
    for (let index = 0; index < inputCount; index++, cursor += 2) {
        input.push(offset + reader.u16(cursor));
    }
    const lookaheadCount = reader.u16(cursor);
    cursor += 2;
    const lookahead: number[] = [];
    for (let index = 0; index < lookaheadCount; index++, cursor += 2) {
        lookahead.push(offset + reader.u16(cursor));
    }
    const substitutionCount = reader.u16(cursor);
    return applyContextRecords(reader, glyphs, input, backtrack, lookahead, cursor + 2, substitutionCount);
}

function applyContextRecords(
    reader: OpenTypeReader,
    glyphs: Glyph[],
    inputCoverages: number[],
    backtrackCoverages: number[],
    lookaheadCoverages: number[],
    recordsOffset: number,
    recordCount: number
): Glyph[] {
    const lookupList = reader.u16(8);
    for (let start = 0; start + inputCoverages.length <= glyphs.length; start++) {
        if (!matchesCoverages(reader, glyphs, start, inputCoverages, 1)) {
            continue;
        }
        if (!matchesCoverages(reader, glyphs, start - 1, backtrackCoverages, -1)) {
            continue;
        }
        if (!matchesCoverages(reader, glyphs, start + inputCoverages.length, lookaheadCoverages, 1)) {
            continue;
        }
        for (let recordIndex = 0; recordIndex < recordCount; recordIndex++) {
            const recordOffset = recordsOffset + recordIndex * 4;
            const sequenceIndex = reader.u16(recordOffset);
            const target = glyphs[start + sequenceIndex];
            if (!target) {
                continue;
            }
            const lookupIndex = reader.u16(recordOffset + 2);
            const lookupOffset = lookupList + reader.u16(lookupList + 2 + lookupIndex * 2);
            glyphs = applySubstitutionLookup(reader, lookupOffset, glyphs, (glyph) => glyph === target);
        }
    }
    return glyphs;
}

function matchesCoverages(
    reader: OpenTypeReader,
    glyphs: Glyph[],
    start: number,
    coverages: number[],
    increment: -1 | 1
): boolean {
    for (let index = 0; index < coverages.length; index++) {
        const glyph = glyphs[start + index * increment];
        if (!glyph || getCoverageIndex(reader, coverages[index], glyph.glyphId) < 0) {
            return false;
        }
    }
    return true;
}

function applyMultipleSubstitution(
    reader: OpenTypeReader,
    offset: number,
    glyphs: Glyph[],
    filter?: LookupFilter
): Glyph[] {
    if (reader.u16(offset) !== 1) {
        return glyphs;
    }
    const coverage = offset + reader.u16(offset + 2);
    const sequenceCount = reader.u16(offset + 4);
    for (let glyphIndex = glyphs.length - 1; glyphIndex >= 0; glyphIndex--) {
        const source = glyphs[glyphIndex];
        if (filter && !filter(source)) {
            continue;
        }
        const coverageIndex = getCoverageIndex(reader, coverage, source.glyphId);
        if (coverageIndex < 0 || coverageIndex >= sequenceCount) {
            continue;
        }
        const sequence = offset + reader.u16(offset + 6 + coverageIndex * 2);
        const glyphCount = reader.u16(sequence);
        const replacements: Glyph[] = [];
        for (let index = 0; index < glyphCount; index++) {
            replacements.push({
                ...source,
                glyphId: reader.u16(sequence + 2 + index * 2),
                unicode: index ? '' : source.unicode,
            });
        }
        glyphs.splice(glyphIndex, 1, ...replacements);
    }
    return glyphs;
}

function applySingleSubstitution(reader: OpenTypeReader, offset: number, glyphs: Glyph[], filter?: LookupFilter): void {
    const format = reader.u16(offset);
    const coverageOffset = offset + reader.u16(offset + 2);
    for (const glyph of glyphs) {
        if (filter && !filter(glyph)) {
            continue;
        }
        const coverageIndex = getCoverageIndex(reader, coverageOffset, glyph.glyphId);
        if (coverageIndex < 0) {
            continue;
        }
        if (format === 1) {
            glyph.glyphId = (glyph.glyphId + reader.i16(offset + 4)) & 0xffff;
        } else if (format === 2 && coverageIndex < reader.u16(offset + 4)) {
            glyph.glyphId = reader.u16(offset + 6 + coverageIndex * 2);
        }
    }
}

function applyLigatureSubstitution(
    reader: OpenTypeReader,
    offset: number,
    glyphs: Glyph[],
    filter?: LookupFilter
): Glyph[] {
    if (reader.u16(offset) !== 1) {
        return glyphs;
    }
    const coverageOffset = offset + reader.u16(offset + 2);
    const ligatureSetCount = reader.u16(offset + 4);

    for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex++) {
        const first = glyphs[glyphIndex];
        if (filter && !filter(first)) {
            continue;
        }
        const coverageIndex = getCoverageIndex(reader, coverageOffset, first.glyphId);
        if (coverageIndex < 0 || coverageIndex >= ligatureSetCount) {
            continue;
        }
        const setOffset = offset + reader.u16(offset + 6 + coverageIndex * 2);
        const ligatureCount = reader.u16(setOffset);
        for (let ligatureIndex = 0; ligatureIndex < ligatureCount; ligatureIndex++) {
            const ligatureOffset = setOffset + reader.u16(setOffset + 2 + ligatureIndex * 2);
            const componentCount = reader.u16(ligatureOffset + 2);
            if (componentCount < 2 || glyphIndex + componentCount > glyphs.length) {
                continue;
            }
            let matches = true;
            for (let componentIndex = 1; componentIndex < componentCount; componentIndex++) {
                if (
                    glyphs[glyphIndex + componentIndex].glyphId !== reader.u16(ligatureOffset + 2 + componentIndex * 2)
                ) {
                    matches = false;
                    break;
                }
            }
            if (!matches) {
                continue;
            }
            const components = glyphs.slice(glyphIndex, glyphIndex + componentCount);
            const ligatureGlyphId = reader.u16(ligatureOffset);
            glyphs.splice(glyphIndex, componentCount, {
                ...first,
                glyphId: ligatureGlyphId,
                unicode: components.map((component) => component.unicode).join(''),
                xAdvance: components.reduce((sum, component) => sum + component.xAdvance, 0),
            });
            break;
        }
    }
    return glyphs;
}

function applyGposLookups(reader: OpenTypeReader, lookupOffsets: number[], glyphs: Glyph[]): void {
    for (const lookupOffset of lookupOffsets) {
        const lookupType = reader.u16(lookupOffset);
        const lookupFlags = reader.u16(lookupOffset + 2);
        const subtableCount = reader.u16(lookupOffset + 4);
        for (let index = 0; index < subtableCount; index++) {
            let subtableOffset = lookupOffset + reader.u16(lookupOffset + 6 + index * 2);
            let resolvedType = lookupType;
            if (lookupType === 9 && reader.u16(subtableOffset) === 1) {
                resolvedType = reader.u16(subtableOffset + 2);
                subtableOffset += reader.u32(subtableOffset + 4);
            }
            if (resolvedType === 2) {
                applyPairPositioning(reader, subtableOffset, glyphs);
            } else if (resolvedType === 3) {
                applyCursivePositioning(reader, subtableOffset, glyphs, (lookupFlags & 0x0001) !== 0);
            } else if (resolvedType === 4) {
                applyMarkToBasePositioning(reader, subtableOffset, glyphs);
            } else if (resolvedType === 6) {
                applyMarkToMarkPositioning(reader, subtableOffset, glyphs);
            }
        }
    }
}

function applyCursivePositioning(reader: OpenTypeReader, offset: number, glyphs: Glyph[], rightToLeft: boolean): void {
    if (reader.u16(offset) !== 1) {
        return;
    }
    const coverage = offset + reader.u16(offset + 2);
    const recordCount = reader.u16(offset + 4);
    for (let index = 0; index + 1 < glyphs.length; index++) {
        const firstCoverage = getCoverageIndex(reader, coverage, glyphs[index].glyphId);
        const secondCoverage = getCoverageIndex(reader, coverage, glyphs[index + 1].glyphId);
        if (firstCoverage < 0 || secondCoverage < 0 || firstCoverage >= recordCount || secondCoverage >= recordCount) {
            continue;
        }
        const firstRecord = offset + 6 + firstCoverage * 4;
        const secondRecord = offset + 6 + secondCoverage * 4;
        const firstAnchorOffset = reader.u16(firstRecord + (rightToLeft ? 0 : 2));
        const secondAnchorOffset = reader.u16(secondRecord + (rightToLeft ? 2 : 0));
        if (!firstAnchorOffset || !secondAnchorOffset) {
            continue;
        }
        const firstAnchor = readAnchor(reader, offset + firstAnchorOffset);
        const secondAnchor = readAnchor(reader, offset + secondAnchorOffset);
        if (!firstAnchor || !secondAnchor) {
            continue;
        }
        glyphs[index].xAdvance += firstAnchor.x - secondAnchor.x;
        glyphs[index + 1].yOffset += glyphs[index].yOffset + firstAnchor.y - secondAnchor.y;
    }
}

function applyMarkToBasePositioning(reader: OpenTypeReader, offset: number, glyphs: Glyph[]): void {
    if (reader.u16(offset) !== 1) {
        return;
    }
    const markCoverage = offset + reader.u16(offset + 2);
    const baseCoverage = offset + reader.u16(offset + 4);
    const classCount = reader.u16(offset + 6);
    const markArray = offset + reader.u16(offset + 8);
    const baseArray = offset + reader.u16(offset + 10);

    for (let markIndex = 1; markIndex < glyphs.length; markIndex++) {
        const markCoverageIndex = getCoverageIndex(reader, markCoverage, glyphs[markIndex].glyphId);
        if (markCoverageIndex < 0 || markCoverageIndex >= reader.u16(markArray)) {
            continue;
        }
        let baseIndex = markIndex - 1;
        let baseCoverageIndex = -1;
        while (baseIndex >= 0) {
            baseCoverageIndex = getCoverageIndex(reader, baseCoverage, glyphs[baseIndex].glyphId);
            if (baseCoverageIndex >= 0) {
                break;
            }
            baseIndex--;
        }
        if (baseCoverageIndex < 0 || baseCoverageIndex >= reader.u16(baseArray)) {
            continue;
        }

        const markRecord = markArray + 2 + markCoverageIndex * 4;
        const markClass = reader.u16(markRecord);
        if (markClass >= classCount) {
            continue;
        }
        const markAnchor = readAnchor(reader, markArray + reader.u16(markRecord + 2));
        const baseAnchorOffset = reader.u16(baseArray + 2 + (baseCoverageIndex * classCount + markClass) * 2);
        if (!baseAnchorOffset || !markAnchor) {
            continue;
        }
        const baseAnchor = readAnchor(reader, baseArray + baseAnchorOffset);
        if (!baseAnchor) {
            continue;
        }

        let interveningAdvance = 0;
        for (let index = baseIndex; index < markIndex; index++) {
            interveningAdvance += glyphs[index].xAdvance;
        }
        glyphs[markIndex].xOffset += baseAnchor.x - markAnchor.x - interveningAdvance;
        glyphs[markIndex].yOffset += baseAnchor.y - markAnchor.y;
        glyphs[markIndex].xAdvance = 0;
    }
}

function applyMarkToMarkPositioning(reader: OpenTypeReader, offset: number, glyphs: Glyph[]): void {
    if (reader.u16(offset) !== 1) {
        return;
    }
    const mark1Coverage = offset + reader.u16(offset + 2);
    const mark2Coverage = offset + reader.u16(offset + 4);
    const classCount = reader.u16(offset + 6);
    const mark1Array = offset + reader.u16(offset + 8);
    const mark2Array = offset + reader.u16(offset + 10);

    for (let markIndex = 1; markIndex < glyphs.length; markIndex++) {
        const mark1Index = getCoverageIndex(reader, mark1Coverage, glyphs[markIndex].glyphId);
        const mark2Index = getCoverageIndex(reader, mark2Coverage, glyphs[markIndex - 1].glyphId);
        if (
            mark1Index < 0 ||
            mark2Index < 0 ||
            mark1Index >= reader.u16(mark1Array) ||
            mark2Index >= reader.u16(mark2Array)
        ) {
            continue;
        }
        const markRecord = mark1Array + 2 + mark1Index * 4;
        const markClass = reader.u16(markRecord);
        if (markClass >= classCount) {
            continue;
        }
        const mark1Anchor = readAnchor(reader, mark1Array + reader.u16(markRecord + 2));
        const mark2AnchorOffset = reader.u16(mark2Array + 2 + (mark2Index * classCount + markClass) * 2);
        if (!mark1Anchor || !mark2AnchorOffset) {
            continue;
        }
        const mark2Anchor = readAnchor(reader, mark2Array + mark2AnchorOffset);
        if (!mark2Anchor) {
            continue;
        }
        glyphs[markIndex].xOffset += glyphs[markIndex - 1].xOffset + mark2Anchor.x - mark1Anchor.x;
        glyphs[markIndex].yOffset += glyphs[markIndex - 1].yOffset + mark2Anchor.y - mark1Anchor.y;
        glyphs[markIndex].xAdvance = 0;
    }
}

function readAnchor(reader: OpenTypeReader, offset: number): { x: number; y: number } | undefined {
    const format = reader.u16(offset);
    if (format < 1 || format > 3) {
        return undefined;
    }
    return { x: reader.i16(offset + 2), y: reader.i16(offset + 4) };
}

function applyPairPositioning(reader: OpenTypeReader, offset: number, glyphs: Glyph[]): void {
    const format = reader.u16(offset);
    const coverageOffset = offset + reader.u16(offset + 2);
    const valueFormat1 = reader.u16(offset + 4);
    const valueFormat2 = reader.u16(offset + 6);
    const valueSize1 = getValueRecordSize(valueFormat1);
    const valueSize2 = getValueRecordSize(valueFormat2);

    for (let index = 0; index + 1 < glyphs.length; index++) {
        const first = glyphs[index];
        const second = glyphs[index + 1];
        const coverageIndex = getCoverageIndex(reader, coverageOffset, first.glyphId);
        if (coverageIndex < 0) {
            continue;
        }
        let recordOffset = -1;
        if (format === 1) {
            const pairSetCount = reader.u16(offset + 8);
            if (coverageIndex >= pairSetCount) {
                continue;
            }
            const pairSetOffset = offset + reader.u16(offset + 10 + coverageIndex * 2);
            const pairValueCount = reader.u16(pairSetOffset);
            const recordSize = 2 + valueSize1 + valueSize2;
            for (let pairIndex = 0; pairIndex < pairValueCount; pairIndex++) {
                const candidate = pairSetOffset + 2 + pairIndex * recordSize;
                if (reader.u16(candidate) === second.glyphId) {
                    recordOffset = candidate + 2;
                    break;
                }
            }
        } else if (format === 2) {
            const classDef1 = offset + reader.u16(offset + 8);
            const classDef2 = offset + reader.u16(offset + 10);
            const class1Count = reader.u16(offset + 12);
            const class2Count = reader.u16(offset + 14);
            const class1 = getGlyphClass(reader, classDef1, first.glyphId);
            const class2 = getGlyphClass(reader, classDef2, second.glyphId);
            if (class1 < class1Count && class2 < class2Count) {
                recordOffset = offset + 16 + (class1 * class2Count + class2) * (valueSize1 + valueSize2);
            }
        }
        if (recordOffset >= 0) {
            applyValueRecord(reader, recordOffset, valueFormat1, first);
            applyValueRecord(reader, recordOffset + valueSize1, valueFormat2, second);
        }
    }
}

function applyValueRecord(reader: OpenTypeReader, offset: number, format: number, glyph: Glyph): void {
    let cursor = offset;
    if (format & 0x0001) {
        glyph.xOffset += reader.i16(cursor);
        cursor += 2;
    }
    if (format & 0x0002) {
        glyph.yOffset += reader.i16(cursor);
        cursor += 2;
    }
    if (format & 0x0004) {
        glyph.xAdvance += reader.i16(cursor);
        cursor += 2;
    }
    if (format & 0x0008) {
        glyph.yAdvance += reader.i16(cursor);
    }
}

function getFeatureLookupOffsets(
    reader: OpenTypeReader,
    script: string,
    language: string | undefined,
    requestedFeature: string
): number[] {
    try {
        const scriptList = reader.u16(4);
        const featureList = reader.u16(6);
        const lookupList = reader.u16(8);
        const scriptOffset =
            findTaggedRecord(reader, scriptList, script) ?? findTaggedRecord(reader, scriptList, 'DFLT');
        if (scriptOffset == null) {
            return [];
        }
        const scriptTable = scriptList + scriptOffset;
        const languageTag = toOpenTypeLanguageTag(language);
        const langSysRelative =
            (languageTag
                ? findTaggedRecord(reader, scriptTable + 4, languageTag, reader.u16(scriptTable + 2))
                : undefined) ?? reader.u16(scriptTable);
        if (!langSysRelative) {
            return [];
        }
        const langSys = scriptTable + langSysRelative;
        const featureCount = reader.u16(langSys + 4);
        const requiredFeatureIndex = reader.u16(langSys + 2);
        const featureIndices: number[] = [];
        if (requiredFeatureIndex !== 0xffff) {
            featureIndices.push(requiredFeatureIndex);
        }
        for (let index = 0; index < featureCount; index++) {
            featureIndices.push(reader.u16(langSys + 6 + index * 2));
        }
        const lookupIndices: number[] = [];
        for (const featureIndex of featureIndices) {
            const featureRecord = featureList + 2 + featureIndex * 6;
            if (reader.tag(featureRecord) !== requestedFeature) {
                continue;
            }
            const featureTable = featureList + reader.u16(featureRecord + 4);
            const lookupCount = reader.u16(featureTable + 2);
            for (let lookupIndex = 0; lookupIndex < lookupCount; lookupIndex++) {
                lookupIndices.push(reader.u16(featureTable + 4 + lookupIndex * 2));
            }
        }
        const lookupOffsets: number[] = [];
        for (const lookupIndex of lookupIndices) {
            lookupOffsets.push(lookupList + reader.u16(lookupList + 2 + lookupIndex * 2));
        }
        return lookupOffsets;
    } catch {
        // optional layout tables should not make an otherwise usable font fail
        return [];
    }
}

function findTaggedRecord(
    reader: OpenTypeReader,
    listOffset: number,
    target: string,
    explicitCount?: number
): number | undefined {
    const count = explicitCount ?? reader.u16(listOffset);
    const recordsOffset = explicitCount == null ? listOffset + 2 : listOffset;
    for (let index = 0; index < count; index++) {
        const recordOffset = recordsOffset + index * 6;
        if (reader.tag(recordOffset) === target) {
            return reader.u16(recordOffset + 4);
        }
    }
    return undefined;
}

function getCoverageIndex(reader: OpenTypeReader, offset: number, glyphId: number): number {
    const format = reader.u16(offset);
    if (format === 1) {
        const count = reader.u16(offset + 2);
        for (let index = 0; index < count; index++) {
            if (reader.u16(offset + 4 + index * 2) === glyphId) {
                return index;
            }
        }
    } else if (format === 2) {
        const count = reader.u16(offset + 2);
        for (let index = 0; index < count; index++) {
            const rangeOffset = offset + 4 + index * 6;
            const start = reader.u16(rangeOffset);
            const end = reader.u16(rangeOffset + 2);
            if (glyphId >= start && glyphId <= end) {
                return reader.u16(rangeOffset + 4) + glyphId - start;
            }
        }
    }
    return -1;
}

function getGlyphClass(reader: OpenTypeReader, offset: number, glyphId: number): number {
    const format = reader.u16(offset);
    if (format === 1) {
        const start = reader.u16(offset + 2);
        const count = reader.u16(offset + 4);
        return glyphId >= start && glyphId < start + count ? reader.u16(offset + 6 + (glyphId - start) * 2) : 0;
    }
    if (format === 2) {
        const count = reader.u16(offset + 2);
        for (let index = 0; index < count; index++) {
            const rangeOffset = offset + 4 + index * 6;
            if (glyphId >= reader.u16(rangeOffset) && glyphId <= reader.u16(rangeOffset + 2)) {
                return reader.u16(rangeOffset + 4);
            }
        }
    }
    return 0;
}

function getValueRecordSize(format: number): number {
    let fields = 0;
    for (let bit = 0; bit < 8; bit++) {
        if (format & (1 << bit)) {
            fields++;
        }
    }
    return fields * 2;
}

function createLogicalCharacters(text: string): Array<{ text: string; codePoint: number; sourceIndex: number }> {
    const characters: Array<{ text: string; codePoint: number; sourceIndex: number }> = [];
    let sourceIndex = 0;
    for (const value of text) {
        characters.push({ text: value, codePoint: value.codePointAt(0) ?? 0xfffd, sourceIndex });
        sourceIndex += value.length;
    }
    return characters;
}

function detectOpenTypeScript(characters: Array<{ codePoint: number }>, language: string | undefined): string {
    const primaryLanguage = language?.toLowerCase().split('-')[0];
    if (primaryLanguage === 'ja') {
        return 'kana';
    }
    if (primaryLanguage === 'zh') {
        return 'hani';
    }
    let hasLatinCharacters = false;
    for (const character of characters) {
        const codePoint = character.codePoint;
        if (codePoint >= 0x0600 && codePoint <= 0x08ff) {
            return 'arab';
        }
        if (codePoint >= 0x0590 && codePoint <= 0x05ff) {
            return 'hebr';
        }
        if (codePoint >= 0x0370 && codePoint <= 0x03ff) {
            return 'grek';
        }
        if (codePoint >= 0x0400 && codePoint <= 0x052f) {
            return 'cyrl';
        }
        if (codePoint >= 0x3040 && codePoint <= 0x30ff) {
            return 'kana';
        }
        if (codePoint >= 0x3400 && codePoint <= 0x9fff) {
            return 'hani';
        }
        if (
            (codePoint >= 0x0041 && codePoint <= 0x005a) ||
            (codePoint >= 0x0061 && codePoint <= 0x007a) ||
            (codePoint >= 0x00c0 && codePoint <= 0x02af)
        ) {
            hasLatinCharacters = true;
        }
    }
    if (!hasLatinCharacters && primaryLanguage && ARABIC_SCRIPT_LANGUAGES.has(primaryLanguage)) {
        return 'arab';
    }
    return 'latn';
}

function resolveArabicJoiningFeatures(
    characters: Array<{ codePoint: number; sourceIndex: number }>
): Map<number, (typeof ARABIC_FEATURES)[number]> {
    const features = new Map<number, (typeof ARABIC_FEATURES)[number]>();
    for (let index = 0; index < characters.length; index++) {
        const joining = getJoiningType(characters[index].codePoint);
        if (joining === 'U' || joining === 'T') {
            continue;
        }
        const previous = findJoiningType(characters, index, -1);
        const next = findJoiningType(characters, index, 1);
        const joinsPrevious = (joining === 'D' || joining === 'R') && previous === 'D';
        const joinsNext = joining === 'D' && (next === 'D' || next === 'R');
        features.set(
            characters[index].sourceIndex,
            joinsPrevious && joinsNext ? 'medi' : joinsPrevious ? 'fina' : joinsNext ? 'init' : 'isol'
        );
    }
    return features;
}

function findJoiningType(
    characters: Array<{ codePoint: number }>,
    start: number,
    increment: -1 | 1
): 'D' | 'R' | 'U' | undefined {
    for (let index = start + increment; index >= 0 && index < characters.length; index += increment) {
        const joining = getJoiningType(characters[index].codePoint);
        if (joining !== 'T') {
            return joining;
        }
    }
    return undefined;
}

function getJoiningType(codePoint: number): 'D' | 'R' | 'T' | 'U' {
    if (
        (codePoint >= 0x0610 && codePoint <= 0x061a) ||
        (codePoint >= 0x064b && codePoint <= 0x065f) ||
        codePoint === 0x0670 ||
        (codePoint >= 0x06d6 && codePoint <= 0x06ed)
    ) {
        return 'T';
    }
    if (
        codePoint === 0x0622 ||
        codePoint === 0x0623 ||
        codePoint === 0x0624 ||
        codePoint === 0x0625 ||
        codePoint === 0x0627 ||
        codePoint === 0x0629 ||
        (codePoint >= 0x062f && codePoint <= 0x0632) ||
        codePoint === 0x0648 ||
        codePoint === 0x0649 ||
        codePoint === 0x0671 ||
        codePoint === 0x0698
    ) {
        return 'R';
    }
    return codePoint >= 0x0620 && codePoint <= 0x06d3 ? 'D' : 'U';
}

function toOpenTypeLanguageTag(language: string | undefined): string | undefined {
    if (!language) {
        return undefined;
    }
    const normalised = language.toLowerCase();
    const primary = normalised.split('-')[0];
    const tags: Record<string, string> = {
        ar: 'ARA ',
        bg: 'BGR ',
        el: 'ELL ',
        fa: 'FAR ',
        he: 'IWR ',
        ja: 'JAN ',
        ur: 'URD ',
        zh: normalised.includes('-tw') || normalised.includes('-hk') || normalised.includes('-hant') ? 'ZHT ' : 'ZHS ',
    };
    return tags[primary];
}

class OpenTypeReader {
    private readonly view: DataView;

    public constructor(private readonly data: Uint8Array) {
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    }

    public u16(offset: number): number {
        this.ensure(offset, 2);
        return this.view.getUint16(offset, false);
    }

    public i16(offset: number): number {
        this.ensure(offset, 2);
        return this.view.getInt16(offset, false);
    }

    public u32(offset: number): number {
        this.ensure(offset, 4);
        return this.view.getUint32(offset, false);
    }

    public tag(offset: number): string {
        this.ensure(offset, 4);
        return String.fromCharCode(
            this.data[offset],
            this.data[offset + 1],
            this.data[offset + 2],
            this.data[offset + 3]
        );
    }

    private ensure(offset: number, length: number): void {
        if (offset < 0 || offset + length > this.data.length) {
            throw new Error('Invalid OpenType layout offset.');
        }
    }
}
