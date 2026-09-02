import type { Framework, MenuItem } from '@ag-grid-types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import type { LlmsTxtSection } from '@utils/agentReadinessFiles';
import { urlWithPrefix } from '@utils/urlWithPrefix';

/**
 * Flatten the docs nav into the grouped link index `llms.txt` publishes.
 *
 * Publishing the nav rather than a flat sitemap dump gives an agent the section a page belongs
 * to as well as its URL. Groups are named by their full path (`Core Features > Editing`), which
 * keeps the file one heading level deep.
 */

/** A nav item that points somewhere; headings and groups are structure, not destinations. */
function isDestination(item: MenuItem): boolean {
    return Boolean(item.path || item.url);
}

function isAvailableFor(item: MenuItem, framework: Framework): boolean {
    return !item.frameworks || item.frameworks.includes(framework);
}

/** Depth-first, emitting a group per nav group that has destinations for `framework`. */
export function navSectionsToIndex({
    sections,
    framework,
    siteRoot,
    titlePrefix,
}: {
    sections: MenuItem[];
    framework: Framework;
    siteRoot?: string;
    /** For a nav whose section titles need naming from outside — the API nav's are `Grid`, `Row`. */
    titlePrefix?: string;
}): LlmsTxtSection[] {
    const index: LlmsTxtSection[] = [];

    const walk = (items: MenuItem[], trail: string[]) => {
        const links = items
            .filter((item) => isDestination(item) && isAvailableFor(item, framework))
            .map((item) => ({
                title: item.title,
                url: toAbsoluteUrl(urlWithPrefix({ url: item.url ?? `./${item.path}/`, framework }), siteRoot),
            }));
        if (links.length) {
            // A nav section can be untitled — the API nav opens with a `hideTitle` section
            // holding the reference landing page — so drop the empty level from the heading.
            index.push({ title: trail.filter(Boolean).join(' > '), links });
        }
        for (const item of items) {
            if (item.children) {
                walk(item.children, [...trail, item.title]);
            }
        }
    };

    for (const section of sections) {
        walk(section.children ?? [], titlePrefix ? [titlePrefix, section.title] : [section.title]);
    }

    return index;
}

/** Every docs page name the nav lists, so the caller can spot pages the nav does not reach. */
export function navPageNames(sections: MenuItem[]): Set<string> {
    const names = new Set<string>();
    const walk = (items: MenuItem[]) => {
        for (const item of items) {
            if (item.path) {
                names.add(item.path);
            }
            item.childPaths?.forEach((path) => names.add(path));
            if (item.children) {
                walk(item.children);
            }
        }
    };
    walk(sections);
    return names;
}
