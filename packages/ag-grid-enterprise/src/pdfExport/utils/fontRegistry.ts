import type {
    PdfBuiltInFontFamily,
    PdfFontFamily,
    PdfFontFamilyDefinition,
    PdfFontStyle,
    PdfFontWeight,
    PdfTextDirection,
} from 'ag-grid-community';

import { getBase14BaselineOffset, getBase14GlyphWidth } from './document/fontMetrics';
import { escapePdfString } from './document/text';
import { getGlyphMappingKey } from './glyphRun';
import type { PdfGlyphRun } from './glyphRun';
import { shapeTrueTypeText } from './openType/shaping';
import { resolveVisualText } from './textDirection';
import type { TrueTypeFont } from './ttf';
import { parseTrueTypeFont } from './ttf';

const BUILT_IN_FONT_FAMILIES = new Set<PdfBuiltInFontFamily>([
    'Helvetica',
    'Helvetica-Bold',
    'Times-Roman',
    'Times-Bold',
    'Courier',
    'Courier-Bold',
]);
const BUILT_IN_FONT_FAMILY_NAMES = new Set(Array.from(BUILT_IN_FONT_FAMILIES, (family) => normaliseFamilyName(family)));

export interface ResolvedPdfFont {
    readonly key: string;
    readonly family: PdfFontFamily;
    readonly weight: number;
    readonly style: PdfFontStyle;
    readonly builtInFamily?: PdfBuiltInFontFamily;
    readonly trueType?: TrueTypeFont;
    readonly cidByMapping: Map<string, number>;
    readonly mappingByCid: Map<number, { glyphId: number; unicode: string }>;
}

export interface EncodedPdfText {
    readonly operatorValue: string;
    readonly visualText: string;
    readonly direction: 'ltr' | 'rtl';
    readonly logicalText: string;
    readonly glyphRun?: PdfGlyphRun;
    readonly positionedGlyphs?: EncodedPdfGlyph[];
}

interface EncodedPdfGlyph {
    readonly fontKey: string;
    readonly operatorValue: string;
    /** Horizontal advance as a proportion of the font size. */
    readonly xAdvance: number;
    /** Vertical advance as a proportion of the font size. */
    readonly yAdvance: number;
    /** Horizontal offset as a proportion of the font size. */
    readonly xOffset: number;
    /** Vertical offset as a proportion of the font size. */
    readonly yOffset: number;
}

type RegisteredFace = {
    weight: number;
    style: PdfFontStyle;
    font: TrueTypeFont;
};

export class PdfFontFamilyNotRegisteredError extends Error {
    public constructor(
        public readonly family: string,
        public readonly registeredFamilies: string[]
    ) {
        super(`PDF font family "${family}" is not registered.`);
        this.name = 'PdfFontFamilyNotRegisteredError';
    }
}

/**
 * Per-export registry responsible for resolving, measuring and encoding font faces.
 */
export class PdfFontRegistry {
    private readonly customFamilies = new Map<string, { family: string; faces: RegisteredFace[] }>();
    private readonly resolvedFonts = new Map<string, ResolvedPdfFont>();
    private readonly shapedRuns = new Map<string, PdfGlyphRun>();
    private nextFontIndex = 1;

    public constructor(definitions: PdfFontFamilyDefinition[] | undefined) {
        for (const definition of definitions ?? []) {
            this.registerFamily(definition);
        }
    }

    /**
     * Resolve a requested family, weight and style to one concrete font face.
     * @param family - Requested family.
     * @param weight - Requested weight.
     * @param style - Requested style.
     * @param fallbackFamily - Family inherited from the surrounding style.
     * @returns Concrete font used for measurement and rendering.
     */
    public resolve(
        family: PdfFontFamily | undefined,
        weight: PdfFontWeight | number | undefined,
        style: PdfFontStyle | undefined,
        fallbackFamily: PdfFontFamily = 'Helvetica'
    ): ResolvedPdfFont {
        const requestedFamily = family || fallbackFamily;
        const requestedWeight = normaliseFontWeight(weight, getBuiltInWeight(requestedFamily));
        const requestedStyle = style ?? 'normal';
        const customFamily = this.customFamilies.get(normaliseFamilyName(requestedFamily));

        if (customFamily) {
            const face = selectFace(customFamily.faces, requestedWeight, requestedStyle);
            return this.getOrCreateCustomFont(customFamily.family, face);
        }
        if (!BUILT_IN_FONT_FAMILIES.has(requestedFamily as PdfBuiltInFontFamily)) {
            throw new PdfFontFamilyNotRegisteredError(requestedFamily, this.getRegisteredFamilyNames());
        }

        const builtInFamily = resolveBuiltInFamily(requestedFamily as PdfBuiltInFontFamily, requestedWeight);
        return this.getOrCreateBuiltInFont(builtInFamily);
    }

    /**
     * Measure text using the selected font's advance widths.
     * @param text - Logical-order text.
     * @param fontSize - Font size in points.
     * @param font - Resolved font.
     * @param direction - Requested text direction.
     * @returns Text width in points.
     */
    public measureText(
        text: string,
        fontSize: number,
        font: ResolvedPdfFont,
        direction: PdfTextDirection = 'auto',
        language?: string
    ): number {
        let width = 0;

        if (font.trueType) {
            const run = this.getShapedRun(text, font, direction, language);
            for (const glyph of run.glyphs) {
                const fallbackFont = this.getAsciiFallbackFont(glyph.glyphId, glyph.unicode, font);
                if (fallbackFont) {
                    width += (getBase14GlyphWidth(glyph.unicode, fallbackFont.family) / 1000) * fontSize;
                } else {
                    width += (glyph.xAdvance / font.trueType.unitsPerEm) * fontSize;
                }
            }
            return width;
        }

        const visualText = resolveVisualText(text, direction).text;
        const builtInFamily = font.builtInFamily ?? 'Helvetica';
        for (const char of visualText) {
            width += getBase14GlyphWidth(char, builtInFamily);
        }
        return (width / 1000) * fontSize;
    }

    /**
     * Encode text for a PDF `Tj` operator and record used custom glyphs.
     * @param text - Logical-order text.
     * @param font - Resolved font.
     * @param direction - Requested text direction.
     * @returns PDF operand and resolved visual text.
     */
    public encodeText(
        text: string,
        font: ResolvedPdfFont,
        direction: PdfTextDirection = 'auto',
        language?: string
    ): EncodedPdfText {
        const visual = resolveVisualText(text, direction);
        if (!font.trueType) {
            return {
                operatorValue: `(${escapePdfString(visual.text)})`,
                visualText: visual.text,
                direction: visual.direction,
                logicalText: text,
            };
        }

        const glyphRun = this.getShapedRun(text, font, direction, language);
        const positionedGlyphs: EncodedPdfGlyph[] = [];
        let encoded = '';
        for (const glyph of glyphRun.glyphs) {
            const fallbackFont = this.getAsciiFallbackFont(glyph.glyphId, glyph.unicode, font);
            if (fallbackFont) {
                positionedGlyphs.push({
                    fontKey: fallbackFont.key,
                    operatorValue: `(${escapePdfString(glyph.unicode)})`,
                    xAdvance: getBase14GlyphWidth(glyph.unicode, fallbackFont.family) / 1000,
                    yAdvance: 0,
                    xOffset: 0,
                    yOffset: 0,
                });
                continue;
            }

            const mappingKey = getGlyphMappingKey(glyph.glyphId, glyph.unicode);
            let cid = font.cidByMapping.get(mappingKey);
            if (cid == null) {
                if (font.mappingByCid.size >= 0xffff) {
                    throw new Error(`AG Grid: PDF font "${font.family}" exceeded the 65,535 character-code limit.`);
                }
                cid = font.mappingByCid.size + 1;
                font.cidByMapping.set(mappingKey, cid);
                font.mappingByCid.set(cid, { glyphId: glyph.glyphId, unicode: glyph.unicode });
            }
            encoded += cid.toString(16).padStart(4, '0');
            positionedGlyphs.push({
                fontKey: font.key,
                operatorValue: `<${cid.toString(16).padStart(4, '0')}>`,
                xAdvance: glyph.xAdvance / font.trueType.unitsPerEm,
                yAdvance: glyph.yAdvance / font.trueType.unitsPerEm,
                xOffset: glyph.xOffset / font.trueType.unitsPerEm,
                yOffset: glyph.yOffset / font.trueType.unitsPerEm,
            });
        }
        return {
            operatorValue: `<${encoded}>`,
            visualText: glyphRun.glyphs.map((glyph) => glyph.unicode).join(''),
            direction: glyphRun.direction,
            logicalText: text,
            glyphRun,
            positionedGlyphs,
        };
    }

    /**
     * Resolve the baseline offset for a font.
     * @param fontSize - Font size in points.
     * @param font - Resolved font.
     * @returns Distance from the top of the line box to the baseline.
     */
    public getBaselineOffset(fontSize: number, font: ResolvedPdfFont): number {
        if (font.trueType) {
            return (font.trueType.ascent / font.trueType.unitsPerEm) * fontSize;
        }
        return getBase14BaselineOffset(fontSize, font.builtInFamily ?? 'Helvetica');
    }

    /**
     * Resolve the minimum line height needed by a font's ascent and descent.
     * @param fontSize - Font size in points.
     * @param font - Resolved font.
     * @returns Natural line height in points.
     */
    public getNaturalLineHeight(fontSize: number, font: ResolvedPdfFont): number {
        if (!font.trueType) {
            return fontSize;
        }
        const metricHeight = ((font.trueType.ascent - font.trueType.descent) / font.trueType.unitsPerEm) * fontSize;
        return Math.max(fontSize, metricHeight);
    }

    /**
     * Return every concrete font used by the document in deterministic key order.
     * @returns Resolved font resources.
     */
    public getUsedFonts(): ResolvedPdfFont[] {
        return Array.from(this.resolvedFonts.values()).sort(
            (left, right) => Number(left.key.slice(1)) - Number(right.key.slice(1))
        );
    }

    private getShapedRun(
        text: string,
        font: ResolvedPdfFont,
        direction: PdfTextDirection,
        language: string | undefined
    ): PdfGlyphRun {
        const key = `${font.key}\u0000${direction}\u0000${language ?? ''}\u0000${text}`;
        let run = this.shapedRuns.get(key);
        if (!run) {
            run = shapeTrueTypeText(text, font.trueType!, direction, language);
            this.shapedRuns.set(key, run);
        }
        return run;
    }

    private getAsciiFallbackFont(
        glyphId: number,
        unicode: string,
        sourceFont: ResolvedPdfFont
    ): ResolvedPdfFont | undefined {
        if (glyphId || unicode.length !== 1) {
            return undefined;
        }
        const codePoint = unicode.codePointAt(0) ?? 0;
        if (codePoint < 0x20 || codePoint > 0x7e) {
            return undefined;
        }

        return this.resolve('Helvetica', sourceFont.weight, 'normal');
    }

    private getRegisteredFamilyNames(): string[] {
        return [
            ...Array.from(this.customFamilies.values(), (definition) => definition.family),
            ...BUILT_IN_FONT_FAMILIES,
        ];
    }

    private registerFamily(definition: PdfFontFamilyDefinition): void {
        const family = definition.family.trim();
        if (!family) {
            throw new Error('AG Grid: PDF font families require a non-empty family name.');
        }
        if (!definition.faces?.length) {
            throw new Error(`AG Grid: PDF font family "${family}" requires at least one face.`);
        }

        const familyKey = normaliseFamilyName(family);
        if (this.customFamilies.has(familyKey) || BUILT_IN_FONT_FAMILY_NAMES.has(familyKey)) {
            throw new Error(
                `AG Grid: PDF font family "${family}" is registered more than once or uses a reserved name.`
            );
        }

        const faces: RegisteredFace[] = [];
        const faceKeys = new Set<string>();
        for (const definitionFace of definition.faces) {
            const font = parseTrueTypeFont(definitionFace, family);
            const weight = normaliseFontWeight(definitionFace.weight, font.weight);
            const style = definitionFace.style ?? font.style;
            const faceKey = `${weight}:${style}`;
            if (faceKeys.has(faceKey)) {
                throw new Error(`AG Grid: PDF font family "${family}" contains duplicate ${weight} ${style} faces.`);
            }
            faceKeys.add(faceKey);
            faces.push({ weight, style, font });
        }
        this.customFamilies.set(familyKey, { family, faces });
    }

    private getOrCreateCustomFont(family: string, face: RegisteredFace): ResolvedPdfFont {
        const id = `${normaliseFamilyName(family)}:${face.weight}:${face.style}`;
        const existing = this.resolvedFonts.get(id);
        if (existing) {
            return existing;
        }
        const font: ResolvedPdfFont = {
            key: `F${this.nextFontIndex++}`,
            family,
            weight: face.weight,
            style: face.style,
            trueType: face.font,
            cidByMapping: new Map(),
            mappingByCid: new Map(),
        };
        this.resolvedFonts.set(id, font);
        return font;
    }

    private getOrCreateBuiltInFont(family: PdfBuiltInFontFamily): ResolvedPdfFont {
        const existing = this.resolvedFonts.get(family);
        if (existing) {
            return existing;
        }
        const font: ResolvedPdfFont = {
            key: `F${this.nextFontIndex++}`,
            family,
            weight: getBuiltInWeight(family),
            style: 'normal',
            builtInFamily: family,
            cidByMapping: new Map(),
            mappingByCid: new Map(),
        };
        this.resolvedFonts.set(family, font);
        return font;
    }
}

function selectFace(faces: RegisteredFace[], weight: number, style: PdfFontStyle): RegisteredFace {
    let candidates = faces.filter((face) => face.style === style);
    if (!candidates.length && style === 'oblique') {
        candidates = faces.filter((face) => face.style === 'italic');
    }
    if (!candidates.length) {
        candidates = faces.filter((face) => face.style === 'normal');
    }
    if (!candidates.length) {
        candidates = faces;
    }

    let selected = candidates[0];
    let selectedDistance = Math.abs(selected.weight - weight);
    for (let index = 1; index < candidates.length; index++) {
        const candidate = candidates[index];
        const distance = Math.abs(candidate.weight - weight);
        if (distance < selectedDistance || (distance === selectedDistance && candidate.weight > selected.weight)) {
            selected = candidate;
            selectedDistance = distance;
        }
    }
    return selected;
}

function resolveBuiltInFamily(family: PdfBuiltInFontFamily, weight: number): PdfBuiltInFontFamily {
    const bold = weight >= 600;

    if (family === 'Times-Roman' || family === 'Times-Bold') {
        return bold ? 'Times-Bold' : 'Times-Roman';
    }
    if (family === 'Courier' || family === 'Courier-Bold') {
        return bold ? 'Courier-Bold' : 'Courier';
    }
    return bold ? 'Helvetica-Bold' : 'Helvetica';
}

function normaliseFontWeight(weight: PdfFontWeight | number | undefined, fallback = 400): number {
    if (weight === 'bold') {
        return 700;
    }
    if (weight === 'normal' || weight == null) {
        return normaliseNumericWeight(fallback);
    }
    return normaliseNumericWeight(weight);
}

function normaliseNumericWeight(weight: number): number {
    if (!Number.isFinite(weight)) {
        return 400;
    }
    return Math.min(Math.max(Math.round(weight / 100) * 100, 100), 900);
}

function getBuiltInWeight(family: PdfFontFamily): number {
    return family.endsWith('-Bold') ? 700 : 400;
}

function normaliseFamilyName(family: PdfFontFamily): string {
    return family.trim().toLowerCase();
}
