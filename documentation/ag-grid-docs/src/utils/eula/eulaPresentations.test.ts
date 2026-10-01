import { describe, expect, it } from 'vitest';

import eula from '../../content/policies/eula.json';
import { EULA_CONTENT, EULA_PRESENTATIONS } from './eulaPresentations';

describe('EULA_PRESENTATIONS', () => {
    it('generates one preamble per presentation in the content, with every placeholder substituted', () => {
        expect(Object.keys(EULA_PRESENTATIONS).sort()).toEqual(Object.keys(eula.presentations).sort());
        for (const content of Object.values(EULA_PRESENTATIONS)) {
            expect(content.heading).toBe(eula.heading);
            expect(content.meta).toEqual(eula.meta);
            expect(content.intro).toHaveLength(eula.intro.length);
            expect(content.intro.join('\n')).not.toMatch(/\{\w+\}/);
        }
    });

    it('words the notice for using the software and for clicking the checkout button', () => {
        expect(EULA_CONTENT).toBe(EULA_PRESENTATIONS.software);
        expect(EULA_PRESENTATIONS.software.intro).toContain(
            '<strong>BY USING OUR SOFTWARE, YOU CONFIRM THAT YOU ACCEPT AND AGREE TO BE BOUND BY THESE TERMS AND ACKNOWLEDGE THAT THEY CONSTITUTE A LEGALLY BINDING CONTRACT BETWEEN US AND YOU.</strong>'
        );
        expect(EULA_PRESENTATIONS.software.intro).toContain(
            '<strong>IF YOU DO NOT AGREE TO THE TERMS OF THIS LICENCE, DO NOT USE THE SOFTWARE.</strong>'
        );
        expect(EULA_PRESENTATIONS.checkout.intro).toContain(
            '<strong>BY CLICKING ON THE “I ACCEPT” BUTTON BELOW, YOU CONFIRM THAT YOU ACCEPT AND AGREE TO BE BOUND BY THESE TERMS AND ACKNOWLEDGE THAT THEY CONSTITUTE A LEGALLY BINDING CONTRACT BETWEEN US AND YOU.</strong>'
        );
        expect(EULA_PRESENTATIONS.checkout.intro).toContain(
            '<strong>IF YOU DO NOT AGREE TO THE TERMS OF THIS LICENCE, DO NOT CLICK ON THE “I ACCEPT” BUTTON BELOW.</strong>'
        );
    });
});
