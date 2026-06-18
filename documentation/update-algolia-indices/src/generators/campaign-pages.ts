import fs from 'fs';
import path from 'path';

import type { AlgoliaRecord } from '../types/algolia';
import { BRYNTUM_CAMPAIGN_CONTENT_DIR } from '../utils/constants';

interface CampaignContent {
    slug: string;
    title: string;
    meta?: { description?: string };
    sections?: { body_text?: string }[];
}

export interface CampaignSource {
    contentDir: string;
    getPath: (slug: string) => string;
}

const BRYNTUM_SLUG_ALIASES: Record<string, string> = {
    schedulerpro: 'scheduler-pro',
    taskboard: 'task-board',
};

/**
 * Include list of campaign content directories to index in Algolia.
 * Add a new entry here to index a new campaign type.
 */
const CAMPAIGN_SOURCES: CampaignSource[] = [
    {
        contentDir: BRYNTUM_CAMPAIGN_CONTENT_DIR,
        getPath: (slug) => `/campaigns/bryntum-${BRYNTUM_SLUG_ALIASES[slug] ?? slug}/`,
    },
];

const ORIGINAL_SUFFIX = '-original.json';

function extractText(content: CampaignContent): string {
    const parts: string[] = [];

    if (content.meta?.description) {
        parts.push(content.meta.description);
    }

    for (const section of content.sections ?? []) {
        if (section.body_text) {
            parts.push(section.body_text.trim());
        }
    }

    const combined = parts.join(' ').replace(/\s+/g, ' ').trim();
    return combined.length > 250 ? combined.slice(0, combined.lastIndexOf(' ', 250)) + '...' : combined;
}

function getRecordsForSource(source: CampaignSource, rankOffset: number): AlgoliaRecord[] {
    if (!fs.existsSync(source.contentDir)) {
        return [];
    }

    const files = fs.readdirSync(source.contentDir).filter((f) => f.endsWith('.json') && !f.endsWith(ORIGINAL_SUFFIX));

    const records: AlgoliaRecord[] = [];

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(source.contentDir, files[i]);
        const content: CampaignContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const pagePath = source.getPath(content.slug);

        records.push({
            source: 'campaigns',
            objectID: pagePath,
            title: content.title,
            breadcrumb: content.title,
            path: pagePath,
            text: extractText(content),
            rank: 50000 + rankOffset + i,
        });
    }

    return records;
}

export function getCampaignRecords(): AlgoliaRecord[] {
    const records: AlgoliaRecord[] = [];

    for (let i = 0; i < CAMPAIGN_SOURCES.length; i++) {
        records.push(...getRecordsForSource(CAMPAIGN_SOURCES[i], i * 1000));
    }

    return records;
}
