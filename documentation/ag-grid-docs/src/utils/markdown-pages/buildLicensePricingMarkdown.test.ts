import { PRICING_FAQS } from '@ag-website-shared/components/license-pricing/pricingContent';
import { describe, expect, it } from 'vitest';

import { buildLicensePricingMarkdown } from './buildLicensePricingMarkdown';

describe('buildLicensePricingMarkdown', () => {
    const output = buildLicensePricingMarkdown({ siteRoot: 'https://www.ag-grid.com/' });

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "Pricing"');
        expect(output).toContain('\n# Pricing for what you’re building');
    });

    it('publishes no paid price figures', () => {
        expect(output).not.toMatch(/\$\s?\d/);
        expect(output).not.toMatch(/\bUSD\b/);
    });

    it('lists all three products with their buying routes', () => {
        expect(output).toContain('### AG Grid');
        expect(output).toContain('### AG Charts');
        expect(output).toContain('### AG Studio');
        expect(output).toContain('Buy online for 1–10 developer licences for internal applications.');
        expect(output).toContain('[Buy Enterprise online](https://www.ag-grid.com/ecommerce/');
        expect(output).toContain('productType=aggrid');
        expect(output).toContain('productType=agcharts');
        expect(output).toContain('[Buy the Enterprise Bundle](https://www.ag-grid.com/ecommerce/');
        expect(output).toContain('Subscription with tailored pricing.');
        expect(output).toContain('[Start a 45-day free trial](');
        expect(output).toContain('[Contact sales](https://www.ag-grid.com/license-pricing/#contact-sales)');
    });

    it('never uses internal pricing terminology', () => {
        expect(output).not.toMatch(/value-based/i);
    });

    it('renders both feature-comparison matrices with tick/cross marks and resolved links', () => {
        expect(output).toContain('## Compare AG Grid features');
        expect(output).toContain('## Compare AG Charts features');
        expect(output).toContain('| Feature | Community | Enterprise | Enterprise Bundle |');
        // A known grid feature row: MCP Server, linked to its docs page. (The origin is
        // baked in from GRID_URL, which is unset under test, so assert only the path.)
        expect(output).toMatch(/\[MCP Server\]\([^)]*mcp-server/);
        expect(output).toMatch(/\[PDF Export\]\([^)]*pdf-export/);
        expect(output).toContain('✓');
        expect(output).toContain('✗');
    });

    it('renders a feature detail inline when present', () => {
        // Enterprise Support carries a per-column `detail` string.
        expect(output).toContain('Enterprise support via Zendesk');
    });

    it('includes every pricing FAQ', () => {
        expect(output).toContain('## Pricing questions');
        for (const { question } of PRICING_FAQS) {
            expect(output).toContain(`### ${question}`);
        }
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });
});
