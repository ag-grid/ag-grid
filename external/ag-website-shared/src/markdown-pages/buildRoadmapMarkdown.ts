import type { RoadmapItem } from '@ag-website-shared/components/roadmap/types';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

/**
 * A roadmap item as this builder needs it. `status` is widened from `RoadmapItem`'s union to
 * `string` so the raw JSON import type-checks — the twin only prints the status as a label,
 * whereas the page's filter buttons depend on the exact values.
 */
type RoadmapMarkdownItem = Omit<RoadmapItem, 'status'> & { status: string };

export interface RoadmapData {
    introTitle?: string;
    introText?: string;
    items: RoadmapMarkdownItem[];
    lastUpdated: string;
}

export interface BuildRoadmapMarkdownOptions {
    roadmapData: RoadmapData;
    siteRoot?: string;
    /** Resolve an item's `./`-prefixed docs link — the site's `urlWithPrefix` bound to a framework. */
    resolveUrl: (url: string) => string;
    /**
     * Year the quarter headings are labelled with. The page uses the current year via
     * `new Date()`; passed in here so the generated markdown is deterministic for the build.
     */
    year: number;
}

/** Matches the page's `formatLastUpdated`, so both render the date identically. */
function formatLastUpdated(dateStr: string): string {
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr));
}

/**
 * Build the markdown twin of the roadmap page. Reads the same `roadmap.json` the page renders and
 * groups items by quarter exactly as `RoadmapBoard` does. The page's status filter is interactive;
 * here each item carries its status inline instead.
 *
 * Product-agnostic: the caller injects `resolveUrl` and the year, so AG Grid, AG Charts and
 * AG Studio share this module.
 */
export function buildRoadmapMarkdown({ roadmapData, siteRoot, resolveUrl, year }: BuildRoadmapMarkdownOptions): string {
    const document: string[] = [
        [
            '---',
            'title: "Roadmap | AG Grid"',
            'description: "AG Grid Roadmap - see what we are building next, including planned features, items in progress, and recently shipped work."',
            '---',
        ].join('\n'),
        "# What we're building next",
    ];

    if (roadmapData.lastUpdated) {
        document.push(`Last updated: ${formatLastUpdated(roadmapData.lastUpdated)}`);
    }
    if (roadmapData.introTitle) {
        document.push(`## ${roadmapData.introTitle}`);
    }
    if (roadmapData.introText) {
        document.push(roadmapData.introText);
    }

    // Same grouping as RoadmapBoard: one section per quarter, in the order the items appear.
    const byQuarter = new Map<number, RoadmapMarkdownItem[]>();
    for (const item of roadmapData.items) {
        const quarterItems = byQuarter.get(item.q) ?? [];
        quarterItems.push(item);
        byQuarter.set(item.q, quarterItems);
    }

    for (const [quarter, items] of byQuarter) {
        document.push(`## Q${quarter} ${year}`);
        for (const item of items) {
            const title = item.link ? `[${item.title}](${toAbsoluteUrl(resolveUrl(item.link), siteRoot)})` : item.title;
            // Status reads as a label because the page conveys it with a coloured pill.
            document.push(`### ${title} (${item.status.replace(/-/g, ' ')})`);
            if (item.desc) {
                document.push(item.desc);
            }
            if (item.why) {
                document.push(`**Why:** ${item.why}`);
            }
        }
    }

    return `${document.join('\n\n').trimEnd()}\n`;
}
