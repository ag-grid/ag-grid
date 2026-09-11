import eulaBody from '../content/policies/eula.mdoc?raw';
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
                '',
                '### Schedule 1: Support Services {% id="schedule-1" %}',
            ].join('\n')
        );

        expect(sections).toEqual([
            { id: 'acceptance-of-terms', title: 'Acceptance of Terms' },
            { id: 'disclaimers-warranty', title: 'Disclaimers/Warranty' },
            { id: 'schedule-1', title: 'Schedule 1: Support Services' },
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

    it('finds every clause and schedule of the EULA, each with a unique id', () => {
        const sections = getPolicySections(eulaBody);
        const ids = sections.map(({ id }) => id);

        // Only `###` headings are sections; the `####` exhibit sub-headings inside Schedule 2 are not.
        expect(sections.length).toBe((eulaBody.match(/^\s*(?:\d+\.\s+)?### /gm) ?? []).length);
        expect(new Set(ids).size).toBe(ids.length);
        expect(sections[0]).toEqual({ id: 'definitions-and-interpretation', title: 'Definitions and interpretation' });
        expect(sections.at(-1)).toEqual({ id: 'schedule-2-gdpr-sscs', title: 'Schedule 2: GDPR SSCs' });
    });
});
