import { _Theme } from 'ag-charts-community';
import { describe, expect, it } from 'vitest';

import { PUBLIC_PARAM_NAMES } from './chartsTheme';
import { CHARTS_FONT_FAMILY_OPTIONS } from './fonts';
import { PRESETS } from './presets';

/**
 * The presets are hand-authored, and nothing checks them at runtime: a mistyped
 * param name is silently ignored and an unlisted font silently falls back. So
 * these hold them against the API, the font menu and the thumbnails.
 */
describe('charts theme builder presets', () => {
    it('gives every preset a unique id and a real base theme', () => {
        const themeNames = new Set(Object.keys(_Theme.themes));
        expect(new Set(PRESETS.map((preset) => preset.id)).size).toBe(PRESETS.length);
        for (const preset of PRESETS) {
            expect(themeNames, preset.id).toContain(preset.baseTheme);
        }
    });

    it('sets only params AG Charts actually has', () => {
        // A mistyped key is applied to nothing and reported by nobody, so the
        // preset just quietly loses one of its decisions.
        for (const preset of PRESETS) {
            const unknown = Object.keys(preset.params).filter((key) => !PUBLIC_PARAM_NAMES.includes(key));
            expect(unknown, preset.id).toEqual([]);
        }
    });

    it('uses only fonts the font menu offers', () => {
        // The chart imports its own Google fonts, so an unlisted one would still
        // render - but the Font Family control would show "Same as application"
        // for a value it has no option for, and picking anything else would be a
        // one-way door out of the preset's typeface.
        const loaded = new Set(
            CHARTS_FONT_FAMILY_OPTIONS.flatMap(({ value }) =>
                (Array.isArray(value) ? value : [value]).flatMap((font) =>
                    typeof font === 'object' && font != null && 'googleFont' in font ? [font.googleFont] : []
                )
            )
        );
        for (const preset of PRESETS) {
            const font = preset.params.fontFamily;
            if (typeof font === 'object' && font != null && 'googleFont' in font) {
                expect(loaded, preset.id).toContain((font as { googleFont: string }).googleFont);
            }
        }
    });

    it('carries enough series colours for a thumbnail', () => {
        // The cards render eight series, so a shorter palette wraps and two
        // slots come out the same colour - which is exactly the sameness the
        // hand-authored presets exist to avoid.
        for (const preset of PRESETS) {
            expect(preset.palette.fills.length, preset.id).toBeGreaterThanOrEqual(8);
            expect(preset.palette.strokes, preset.id).toHaveLength(preset.palette.fills.length);
            for (const accent of [preset.palette.up, preset.palette.down, preset.palette.neutral]) {
                expect(accent?.fill, preset.id).toBeTruthy();
                expect(accent?.stroke, preset.id).toBeTruthy();
            }
        }
    });

    it('alternates light and dark down the row', () => {
        // Neighbouring cards are the comparison a user makes, and alternating is
        // what stops any two of them reading as the same theme twice.
        const isDark = PRESETS.map((preset) => preset.baseTheme.endsWith('-dark'));
        for (let i = 1; i < isDark.length; i++) {
            expect(isDark[i], `${PRESETS[i - 1].id} then ${PRESETS[i].id}`).not.toBe(isDark[i - 1]);
        }
    });

    it('proposes a look, not only a palette', () => {
        // The stock themes differed from one another by palette alone, which is
        // what made the row read as one theme repeated. Default and Midnight are
        // the deliberate exceptions - they are the untouched base themes.
        for (const preset of PRESETS.filter(({ id }) => id !== 'default' && id !== 'midnight')) {
            expect(Object.keys(preset.params), preset.id).toContain('fontFamily');
            expect(Object.keys(preset.params), preset.id).toContain('backgroundColor');
        }
    });
});
