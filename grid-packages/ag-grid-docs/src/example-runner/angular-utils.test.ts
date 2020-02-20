import { toTitleCase } from './angular-utils';

describe('toTitleCase', () => {
    it('should output title case', () => {
        const titleCase = toTitleCase('my-component-name');

        expect(titleCase).toBe('MyComponentName');
    });
});