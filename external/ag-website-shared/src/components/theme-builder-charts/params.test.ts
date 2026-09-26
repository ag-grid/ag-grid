import { type AgChartThemeName, _Theme } from 'ag-charts-community';
import { describe, expect, it } from 'vitest';

import { PUBLIC_PARAM_NAMES, getStackParams } from './chartsTheme';
import {
    CURATED_KEYS,
    INHERITED_KEYS,
    INHERITED_SOURCES,
    PARAM_GROUPS,
    inheritedKeysOf,
    inheritedSourcesOf,
} from './params';

describe('charts theme builder param layout', () => {
    it('covers every public AG Charts theme param', () => {
        // A new param in the AG Charts API should show up here as a failure,
        // not as a control the builder silently never offers.
        const missing = PUBLIC_PARAM_NAMES.filter((name) => !CURATED_KEYS.includes(name));
        expect(missing).toEqual([]);
    });

    it('offers no param AG Charts does not have', () => {
        const unknown = CURATED_KEYS.filter((key) => !PUBLIC_PARAM_NAMES.includes(key));
        expect(unknown).toEqual([]);
    });

    it('places each param in exactly one group', () => {
        const seen = new Map<string, string[]>();
        for (const group of PARAM_GROUPS) {
            for (const { key } of group.params) {
                seen.set(key, [...(seen.get(key) ?? []), group.id]);
            }
        }
        const duplicated = [...seen.entries()].filter(([, groups]) => groups.length > 1);
        expect(duplicated).toEqual([]);
    });
});

describe('params with an inherited value', () => {
    it('finds the ones that inherit, and only those', () => {
        // The chain the note exists to show: a chrome text colour is the
        // foreground colour, and a tooltip's is the chrome's, so setting the
        // root recolours all three.
        expect(INHERITED_KEYS.has('chromeTextColor')).toBe(true);
        expect(INHERITED_KEYS.has('tooltipTextColor')).toBe(true);
        expect(INHERITED_KEYS.has('foregroundColor')).toBe(false);
        // A composite whose members are references, and a raw CSS string that
        // names a param variable - both inherit.
        expect(INHERITED_KEYS.has('tooltipBorder')).toBe(true);
        expect(INHERITED_KEYS.has('focusShadow')).toBe(true);
        expect(INHERITED_KEYS.has('popupShadow')).toBe(false);
    });

    it('names only params the builder offers', () => {
        expect([...INHERITED_KEYS].filter((key) => !CURATED_KEYS.includes(key))).toEqual([]);
    });

    it('classifies every stock theme the same way', () => {
        // The panel reads one theme's defaults, but a user can be working on any
        // of them. A theme that replaced a derived param with a literal would
        // leave a control hidden that it alone needs shown.
        const names = Object.keys(_Theme.themes) as AgChartThemeName[];
        expect(names.length).toBeGreaterThan(1);
        for (const name of names) {
            expect([...inheritedKeysOf(getStackParams(name))].toSorted(), name).toEqual([...INHERITED_KEYS].toSorted());
        }
    });
});

describe('what a param inherits from', () => {
    it('names the param a plain reference points at', () => {
        expect(inheritedSourcesOf({ ref: 'foregroundColor' })).toEqual(['foregroundColor']);
    });

    it('names both ends of a blend', () => {
        expect(inheritedSourcesOf({ ref: 'foregroundColor', mix: 0.15, onto: 'backgroundColor' })).toEqual([
            'foregroundColor',
            'backgroundColor',
        ]);
    });

    it('names every member of a composite', () => {
        expect(inheritedSourcesOf({ color: { ref: 'borderColor' }, width: { ref: 'borderWidth' } })).toEqual([
            'borderColor',
            'borderWidth',
        ]);
    });

    it('names the params a raw CSS default references', () => {
        expect(inheritedSourcesOf('0 0 0 3px color-mix(in srgb, var(--ag-accent-color) 50%, transparent)')).toEqual([
            'accentColor',
        ]);
    });

    it('names nothing for a value that stands alone', () => {
        expect(inheritedSourcesOf('#fff')).toEqual([]);
        expect(inheritedSourcesOf(12)).toEqual([]);
        expect(inheritedSourcesOf(undefined)).toEqual([]);
        // A variable that is not a public param - AG Charts has private ones -
        // is not something the panel can offer to send the user to.
        expect(inheritedSourcesOf('1px solid var(--ag-not-a-param)')).toEqual([]);
    });

    it('can say what every inherited param inherits from', () => {
        // The note's copy reads "Inherited from <name>", so a param with
        // nothing to name would render an unfinished sentence.
        const unexplained = [...INHERITED_KEYS].filter((key) => !INHERITED_SOURCES[key]?.length);
        expect(unexplained).toEqual([]);
    });

    it('inherits only from params the builder offers', () => {
        const offered = new Set(CURATED_KEYS);
        const dangling = Object.values(INHERITED_SOURCES)
            .flat()
            .filter((source) => !offered.has(source));
        expect(dangling).toEqual([]);
    });
});
