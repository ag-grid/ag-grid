import { describe, expect, it } from 'vitest';

import { resolveBryntumTierTokens } from './bryntumTierTokens';

const TIERS = { core: 'Core' };

describe('resolveBryntumTierTokens', () => {
    it('replaces tokens in every string, including nested objects and arrays', () => {
        const content = {
            heading: '{{tier.core}} tier',
            count: 3,
            sections: [
                { body_html: '<li>{{tier.core}} and {{tier.core}}</li>', tags: ['{{tier.core}}', 'Enterprise'] },
            ],
        };

        expect(resolveBryntumTierTokens(content, TIERS)).toEqual({
            heading: 'Core tier',
            count: 3,
            sections: [{ body_html: '<li>Core and Core</li>', tags: ['Core', 'Enterprise'] }],
        });
    });

    it('leaves other braces and text untouched', () => {
        expect(resolveBryntumTierTokens({ text: '{{other}} {tier.core} Community' }, TIERS)).toEqual({
            text: '{{other}} {tier.core} Community',
        });
    });

    it('throws naming the token when the tier is unknown', () => {
        expect(() => resolveBryntumTierTokens({ sections: [{ text: '{{tier.pro}}' }] }, TIERS)).toThrow('{{tier.pro}}');
    });

    it('does not mutate its input', () => {
        const content = { sections: [{ text: '{{tier.core}}' }] };

        resolveBryntumTierTokens(content, TIERS);

        expect(content).toEqual({ sections: [{ text: '{{tier.core}}' }] });
    });
});
