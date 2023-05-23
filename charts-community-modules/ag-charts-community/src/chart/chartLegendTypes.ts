const TYPES: Record<string, string> = {
    category: 'category',
};

const LEGEND_THEME_TEMPLATES: Record<string, {}> = {};

export const CHART_LEGEND_TYPES = {
    has(legendType: string) {
        return Object.prototype.hasOwnProperty.call(TYPES, legendType);
    },

    get legendTypes() {
        return Object.keys(TYPES);
    },
};

export function registerLegendThemeTemplate(legendType: string, theme: {}) {
    LEGEND_THEME_TEMPLATES[legendType] = theme;
}

export function getLegendThemeTemplate(legendType: string): {} {
    return LEGEND_THEME_TEMPLATES[legendType] ?? {};
}
