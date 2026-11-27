import { getCollection } from 'astro:content';

import type { DecisionPageCollections } from './decisionPages';

/**
 * Every decision page content collection, so each page and its `.md` twin can link to the rest.
 * Kept apart from `decisionPages.ts`, which stays free of `astro:content` for its unit tests.
 */
export const getDecisionPageCollections = async (): Promise<DecisionPageCollections> => ({
    comparePages: await getCollection('comparePages'),
    alternativePages: await getCollection('alternativePages'),
    productAlternativePages: await getCollection('productAlternativePages'),
    solutionPages: await getCollection('solutionPages'),
});
