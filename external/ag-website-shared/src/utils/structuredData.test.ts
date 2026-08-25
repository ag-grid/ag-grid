import {
    buildBreadcrumbList,
    buildContactPage,
    buildJsonLdDocument,
    buildOrganization,
    buildSiteNavigationElement,
    buildSoftwareApplication,
    buildTechArticle,
    buildWebSite,
    getSoftwareApplicationId,
    serializeJsonLd,
} from './structuredData';

const CANONICAL_URL_BASE = 'https://www.ag-grid.com';

describe('buildOrganization', () => {
    test('takes name, url, logo and sameAs from inputs (no @context — supplied by document wrapper)', () => {
        const result = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: ['https://github.com/ag-grid/ag-grid', 'https://x.com/ag_grid'],
        });

        expect(result).toEqual({
            '@type': 'Organization',
            '@id': `${CANONICAL_URL_BASE}/#organization`,
            name: 'AG Grid',
            url: `${CANONICAL_URL_BASE}/`,
            logo: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: ['https://github.com/ag-grid/ag-grid', 'https://x.com/ag_grid'],
        });
        expect(result['@context']).toBeUndefined();
        expect(result.contactPoint).toBeUndefined();
    });

    test('emits a typed contactPoint array when contactPoints are provided', () => {
        const result = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
            contactPoints: [
                {
                    contactType: 'sales',
                    url: `${CANONICAL_URL_BASE}/contact/`,
                    areaServed: 'Worldwide',
                    availableLanguage: 'English',
                },
                {
                    contactType: 'technical support',
                    url: 'https://ag-grid.zendesk.com/',
                    areaServed: 'Worldwide',
                    availableLanguage: 'English',
                },
            ],
        });

        expect(result.contactPoint).toEqual([
            {
                '@type': 'ContactPoint',
                contactType: 'sales',
                url: `${CANONICAL_URL_BASE}/contact/`,
                areaServed: 'Worldwide',
                availableLanguage: 'English',
            },
            {
                '@type': 'ContactPoint',
                contactType: 'technical support',
                url: 'https://ag-grid.zendesk.com/',
                areaServed: 'Worldwide',
                availableLanguage: 'English',
            },
        ]);
    });

    test('emits description and a nested founder Person when provided', () => {
        const result = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: ['https://www.wikidata.org/wiki/Q128283374'],
            description: 'AG Grid is the industry-leading JavaScript Data Grid.',
            founder: {
                name: 'Niall Crosby',
                sameAs: ['https://www.wikidata.org/wiki/Q114758691'],
            },
        });

        expect(result.description).toBe('AG Grid is the industry-leading JavaScript Data Grid.');
        expect(result.founder).toEqual({
            '@type': 'Person',
            name: 'Niall Crosby',
            sameAs: ['https://www.wikidata.org/wiki/Q114758691'],
        });
    });

    test('emits legalName, foundingDate and a nested PostalAddress when provided', () => {
        const result = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
            legalName: 'AG Grid Ltd',
            foundingDate: '2010-07-19',
            address: {
                streetAddress: '70 Wilson Street',
                addressLocality: 'London',
                postalCode: 'EC2A 2DB',
                addressCountry: 'GB',
            },
        });

        expect(result.legalName).toBe('AG Grid Ltd');
        expect(result.foundingDate).toBe('2010-07-19');
        expect(result.address).toEqual({
            '@type': 'PostalAddress',
            streetAddress: '70 Wilson Street',
            addressLocality: 'London',
            postalCode: 'EC2A 2DB',
            addressCountry: 'GB',
        });
    });

    test('emits a typed identifier array of PropertyValue nodes when identifiers are provided', () => {
        const result = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
            identifiers: [
                { propertyID: 'Companies House', value: '07318192' },
                { propertyID: 'VAT', value: 'GB998360167' },
            ],
        });

        expect(result.identifier).toEqual([
            { '@type': 'PropertyValue', propertyID: 'Companies House', value: '07318192' },
            { '@type': 'PropertyValue', propertyID: 'VAT', value: 'GB998360167' },
        ]);
    });

    test('omits description and founder when not provided, and a founder without sameAs has no sameAs key', () => {
        const withoutOptionals = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
        });
        expect(withoutOptionals.description).toBeUndefined();
        expect(withoutOptionals.founder).toBeUndefined();
        expect(withoutOptionals.legalName).toBeUndefined();
        expect(withoutOptionals.foundingDate).toBeUndefined();
        expect(withoutOptionals.address).toBeUndefined();
        expect(withoutOptionals.identifier).toBeUndefined();

        const emptyIdentifiers = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
            identifiers: [],
        });
        expect(emptyIdentifiers.identifier).toBeUndefined();

        const bareFounder = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
            founder: { name: 'Niall Crosby' },
        });
        expect(bareFounder.founder).toEqual({ '@type': 'Person', name: 'Niall Crosby' });
    });
});

describe('buildWebSite', () => {
    test('references the Organization by @id', () => {
        const result = buildWebSite({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            description: 'A feature-rich data grid.',
        });

        expect(result['@type']).toBe('WebSite');
        expect(result['@id']).toBe(`${CANONICAL_URL_BASE}/#website`);
        expect(result.publisher).toEqual({ '@id': `${CANONICAL_URL_BASE}/#organization` });
        expect(result.inLanguage).toBe('en');
    });
});

describe('canonicalUrlBase normalisation', () => {
    test('a trailing slash on canonicalUrlBase does not duplicate in IDs or URLs', () => {
        const withSlash = buildOrganization({
            canonicalUrlBase: `${CANONICAL_URL_BASE}/`,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
        });
        const withoutSlash = buildOrganization({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            logoUrl: `${CANONICAL_URL_BASE}/images/logo.png`,
            sameAs: [],
        });

        expect(withSlash).toEqual(withoutSlash);
        expect(withSlash['@id']).toBe(`${CANONICAL_URL_BASE}/#organization`);
        expect(withSlash.url).toBe(`${CANONICAL_URL_BASE}/`);
    });

    test('subpath canonical bases (AG Charts / AG Studio) retain the subpath in IDs and URLs', () => {
        const chartsBase = 'https://www.ag-grid.com/charts';

        const org = buildOrganization({
            canonicalUrlBase: chartsBase,
            name: 'AG Charts',
            logoUrl: `${chartsBase}/images/logo.png`,
            sameAs: [],
        });

        expect(org['@id']).toBe('https://www.ag-grid.com/charts/#organization');
        expect(org.url).toBe('https://www.ag-grid.com/charts/');
    });
});

describe('buildSoftwareApplication', () => {
    test('uses default applicationCategory and operatingSystem when not provided, and omits offers when empty', () => {
        const result = buildSoftwareApplication({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            version: '34.0.0',
        });

        expect(result['@type']).toBe('SoftwareApplication');
        expect(result.applicationCategory).toBe('DeveloperApplication');
        expect(result.operatingSystem).toBe('Web Browser');
        expect(result.softwareVersion).toBe('34.0.0');
        expect(result.publisher).toEqual({ '@id': `${CANONICAL_URL_BASE}/#organization` });
        expect(result.offers).toBeUndefined();
        expect(result.sameAs).toBeUndefined();
    });

    test('honours caller-supplied applicationCategory, operatingSystem and offers', () => {
        const result = buildSoftwareApplication({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            version: '34.0.0',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'iOS',
            offers: [{ '@type': 'Offer', price: '0', priceCurrency: 'USD' }],
        });

        expect(result.applicationCategory).toBe('BusinessApplication');
        expect(result.operatingSystem).toBe('iOS');
        expect(result.offers).toEqual([{ '@type': 'Offer', price: '0', priceCurrency: 'USD' }]);
    });

    test('emits sameAs entries identifying the application, e.g. its npm package', () => {
        const result = buildSoftwareApplication({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            version: '34.0.0',
            sameAs: ['https://www.npmjs.com/package/ag-grid-community'],
        });

        expect(result.sameAs).toEqual(['https://www.npmjs.com/package/ag-grid-community']);

        const emptySameAs = buildSoftwareApplication({
            canonicalUrlBase: CANONICAL_URL_BASE,
            name: 'AG Grid',
            version: '34.0.0',
            sameAs: [],
        });
        expect(emptySameAs.sameAs).toBeUndefined();
    });
});

describe('buildTechArticle', () => {
    test('always links isPartOf to WebSite and publisher to Organization', () => {
        const pageUrl = `${CANONICAL_URL_BASE}/react-data-grid/getting-started/`;
        const result = buildTechArticle({
            canonicalUrlBase: CANONICAL_URL_BASE,
            pageUrl,
            title: 'Getting Started',
            description: 'Get started with AG Grid for React.',
        });

        expect(result['@type']).toBe('TechArticle');
        expect(result['@id']).toBe(`${pageUrl}#article`);
        expect(result.headline).toBe('Getting Started');
        expect(result.url).toBe(pageUrl);
        expect(result.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': pageUrl });
        expect(result.isPartOf).toEqual({ '@id': `${CANONICAL_URL_BASE}/#website` });
        expect(result.publisher).toEqual({ '@id': `${CANONICAL_URL_BASE}/#organization` });
        expect(result.about).toBeUndefined();
    });

    test('emits an about reference when aboutEntityId is provided', () => {
        const pageUrl = `${CANONICAL_URL_BASE}/react-data-grid/getting-started/`;
        const result = buildTechArticle({
            canonicalUrlBase: CANONICAL_URL_BASE,
            pageUrl,
            title: 'Getting Started',
            description: 'Get started with AG Grid for React.',
            aboutEntityId: getSoftwareApplicationId(CANONICAL_URL_BASE),
        });

        expect(result.about).toEqual({ '@id': `${CANONICAL_URL_BASE}/#software-application` });
    });
});

describe('buildBreadcrumbList', () => {
    test('numbers ListItem positions starting from 1', () => {
        const pageUrl = `${CANONICAL_URL_BASE}/react-data-grid/getting-started/`;
        const result = buildBreadcrumbList({
            pageUrl,
            items: [
                { name: 'Home', url: `${CANONICAL_URL_BASE}/` },
                { name: 'React Data Grid', url: `${CANONICAL_URL_BASE}/react-data-grid/` },
                { name: 'Getting Started', url: pageUrl },
            ],
        });

        expect(result['@type']).toBe('BreadcrumbList');
        expect(result['@id']).toBe(`${pageUrl}#breadcrumb`);
        expect(result.itemListElement).toEqual([
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_URL_BASE}/` },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'React Data Grid',
                item: `${CANONICAL_URL_BASE}/react-data-grid/`,
            },
            { '@type': 'ListItem', position: 3, name: 'Getting Started', item: pageUrl },
        ]);
    });
});

describe('buildSiteNavigationElement', () => {
    test('emits parallel name/url arrays and links to the WebSite by @id', () => {
        const result = buildSiteNavigationElement({
            canonicalUrlBase: CANONICAL_URL_BASE,
            items: [
                { name: 'Demos', url: `${CANONICAL_URL_BASE}/example/` },
                { name: 'Pricing', url: `${CANONICAL_URL_BASE}/license-pricing/` },
            ],
        });

        expect(result).toEqual({
            '@type': 'SiteNavigationElement',
            '@id': `${CANONICAL_URL_BASE}/#site-navigation`,
            name: ['Demos', 'Pricing'],
            url: [`${CANONICAL_URL_BASE}/example/`, `${CANONICAL_URL_BASE}/license-pricing/`],
            isPartOf: { '@id': `${CANONICAL_URL_BASE}/#website` },
        });
    });
});

describe('buildContactPage', () => {
    test('references the Organization and WebSite by @id rather than duplicating them', () => {
        const pageUrl = `${CANONICAL_URL_BASE}/contact/`;
        const result = buildContactPage({
            canonicalUrlBase: CANONICAL_URL_BASE,
            pageUrl,
            name: 'Contact AG Grid',
        });

        expect(result).toEqual({
            '@type': 'ContactPage',
            '@id': `${pageUrl}#contact-page`,
            url: pageUrl,
            name: 'Contact AG Grid',
            isPartOf: { '@id': `${CANONICAL_URL_BASE}/#website` },
            mainEntity: { '@id': `${CANONICAL_URL_BASE}/#organization` },
        });
    });
});

describe('buildJsonLdDocument', () => {
    test('inlines a single node under @context (no @graph wrapper)', () => {
        const node = { '@type': 'Thing', name: 'AG Grid' };

        const result = buildJsonLdDocument([node]);

        expect(result).toEqual({
            '@context': 'https://schema.org',
            '@type': 'Thing',
            name: 'AG Grid',
        });
        expect(result['@graph']).toBeUndefined();
    });

    test('wraps multiple nodes in a single @graph with a shared @context', () => {
        const org = { '@type': 'Organization', name: 'AG Grid' };
        const site = { '@type': 'WebSite', name: 'ag-grid.com' };

        const result = buildJsonLdDocument([org, site]);

        expect(result).toEqual({
            '@context': 'https://schema.org',
            '@graph': [org, site],
        });
    });
});

describe('serializeJsonLd', () => {
    test('produces valid JSON', () => {
        const data = { '@type': 'Thing', name: 'AG Grid' };

        const serialised = serializeJsonLd(data);

        expect(JSON.parse(serialised)).toEqual(data);
    });

    test('escapes </script> sequences to prevent script tag injection', () => {
        const data = {
            '@type': 'Thing',
            description: 'Some text </script><script>alert(1)</script>',
        };

        const serialised = serializeJsonLd(data);

        expect(serialised).not.toContain('</script>');
        expect(serialised).toContain('<\\/script>');
        expect(JSON.parse(serialised)).toEqual(data);
    });
});
