import termsOfUseBody from '../content/policies/terms-of-use.mdoc?raw';
import { getPolicySections } from './policySections';

describe('getPolicySections', () => {
    it('reads the id and title of each numbered heading in document order', () => {
        const sections = getPolicySections(
            [
                '1.  ### Acceptance of Terms {% id="acceptance-of-terms" %}',
                '',
                '    ***',
                '',
                '    Body text with a #### sub-heading reference that is not a section.',
                '',
                '10. ### Disclaimers\\/Warranty {% id="disclaimers-warranty" %}',
            ].join('\n')
        );

        expect(sections).toEqual([
            { id: 'acceptance-of-terms', title: 'Acceptance of Terms' },
            { id: 'disclaimers-warranty', title: 'Disclaimers/Warranty' },
        ]);
    });

    it('finds every section of the terms of use, each with a unique id', () => {
        const sections = getPolicySections(termsOfUseBody);
        const ids = sections.map(({ id }) => id);

        expect(sections.length).toBe((termsOfUseBody.match(/^\s*\d+\.\s+###/gm) ?? []).length);
        expect(sections.length).toBeGreaterThan(0);
        expect(new Set(ids).size).toBe(ids.length);
        expect(sections[0]).toEqual({ id: 'acceptance-of-terms', title: 'Acceptance of Terms' });
        expect(sections.at(-1)).toEqual({ id: 'general', title: 'General' });
    });
});
