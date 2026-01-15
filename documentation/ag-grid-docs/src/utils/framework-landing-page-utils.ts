/**
 * Utility functions for framework landing pages
 * Handles framework logo integration in headings
 */

// Map frameworks to their logo and display name
// Only used for framework landing pages: react-data-grid, javascript-data-grid, vue-data-grid, angular-data-grid
export const frameworkLogoMap: Record<string, { logo: string; name: string }> = {
    react: { logo: 'react.svg', name: 'React' },
    angular: { logo: 'angular.svg', name: 'Angular' },
    vue: { logo: 'vue.svg', name: 'Vue' },
    javascript: { logo: 'javascript.svg', name: 'JavaScript' },
};

/**
 * Normalize framework key from JSON content to frameworkLogoMap key
 */
export function normalizeFrameworkKey(frameworkKey: string | undefined): string {
    if (!frameworkKey) {
        return '';
    }

    // Check if the key exists directly in the map
    if (frameworkLogoMap[frameworkKey]) {
        return frameworkKey;
    }

    // Map framework variants to base framework keys
    const variantMapping: Record<string, string> = {
        vue3: 'vue',
        reactfunctionalt: 'react',
        typescript: 'javascript',
    };

    const normalized = frameworkKey.toLowerCase();
    if (variantMapping[frameworkKey] || variantMapping[normalized]) {
        return variantMapping[frameworkKey] || variantMapping[normalized] || '';
    }

    // Check lowercase version as fallback
    if (frameworkLogoMap[normalized]) {
        return normalized;
    }

    return frameworkKey;
}

/**
 * Generate heading HTML with framework logo
 * Replaces framework name in heading template with logo image + text
 */
export function getHeadingWithLogo(
    frameworkKey: string,
    headingTemplate: string,
    urlWithBaseUrl: (url: string) => string
): string {
    const normalizedKey = normalizeFrameworkKey(frameworkKey);
    const frameworkInfo = frameworkLogoMap[normalizedKey] || frameworkLogoMap['react'];
    const logoUrl = urlWithBaseUrl(`/images/fw-logos/${frameworkInfo.logo}`);
    const frameworkName = frameworkInfo.name;

    // Replace framework name with logo + text
    const logoHtml = `<span style="display: inline-block; white-space: nowrap; vertical-align: baseline;"><img src="${logoUrl}" alt="${frameworkName}" style="display: inline-block; vertical-align: middle; height: 56px; width: auto; margin: 0 0.2em;"/> ${frameworkName}</span>`;
    let heading = headingTemplate.replace(frameworkName, logoHtml);

    // Add <br> before "Data Grids" or "Data Grid"
    heading = heading.replace(/\s+(Data Grids?)/i, '<br>$1');

    return heading;
}

/**
 * Parse heading and replace framework name with logo + text (for hero sections with 56px logo)
 * Returns array of parts to render as JSX
 */
export function parseHeading(
    heading: string,
    frameworkKey: string
): Array<{ type: 'text' | 'logoGroup'; content?: string; logo?: string; name?: string }> {
    const normalizedKey = normalizeFrameworkKey(frameworkKey);
    const frameworkInfo = frameworkLogoMap[normalizedKey];
    if (!frameworkInfo) {
        return [{ type: 'text', content: heading }];
    }

    const regex = new RegExp(`\\b${frameworkInfo.name}\\b`);
    const parts = heading.split(regex);

    if (parts.length === 1) {
        return [{ type: 'text', content: heading }];
    }

    const result: Array<{ type: 'text' | 'logoGroup'; content?: string; logo?: string; name?: string }> = [];
    for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
            result.push({ type: 'text', content: parts[i] });
        }
        if (i < parts.length - 1) {
            result.push({
                type: 'logoGroup',
                logo: frameworkInfo.logo,
                name: frameworkInfo.name,
            });
        }
    }
    return result;
}
