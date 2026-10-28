import { getOrganizationId } from '@ag-website-shared/utils/structuredData';

import { buildTechnicalReviewStructuredData, getAuthorPageUrl, getPersonId } from './technicalReviewers';

describe('buildTechnicalReviewStructuredData', () => {
    const pageUrl = 'https://www.ag-grid.com/react-data-grid/';
    const [webPage, person] = buildTechnicalReviewStructuredData({ pageUrl, reviewer: 'james' });

    test('credits the reviewer on the page by Person @id, not inline', () => {
        expect(webPage).toEqual({
            '@type': 'WebPage',
            '@id': pageUrl,
            url: pageUrl,
            reviewedBy: { '@id': 'https://www.ag-grid.com/blog/author/james/#person' },
        });
    });

    test('emits the Person under the author-page @id', () => {
        expect(person).toEqual({
            '@type': 'Person',
            '@id': getPersonId('james'),
            name: 'James Swinton-Bland',
            jobTitle: 'Developer Relations Lead',
            url: getAuthorPageUrl('james'),
            worksFor: { '@id': getOrganizationId() },
        });
    });
});

describe('getAuthorPageUrl', () => {
    test('points at the production blog author page', () => {
        expect(getAuthorPageUrl('stephen')).toBe('https://www.ag-grid.com/blog/author/stephen/');
    });
});
