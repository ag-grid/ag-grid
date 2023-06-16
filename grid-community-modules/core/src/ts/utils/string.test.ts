import { camelCaseToHumanText, camelCaseToHyphenated } from './string'


describe('camelCaseToHumanText', () => {
    it.each([
        ['thisIsMe', 'This Is Me'],
        ['FTssRRsDSEd', 'F Tss R Rs DS Ed'],
        ['ALL.CAPS', 'ALL CAPS'],
        ['normal.testMe.canUS', 'Normal Test Me Can US'],
        ['SSSTall', 'SSS Tall'],
        ['HEREToThere', 'HERE To There'],
        ['person.address.town', 'Person Address Town'],
        ['person_address.town', 'Person_address Town'],


    ])('Value: %s', (field, expected) => {
        expect(camelCaseToHumanText(field)).toBe(expected);
    });
});

describe('camelCaseToHyphenated', () => {
    it.each([
        ['backgroundColor', 'background-color'],
        ['marginLeft', 'margin-left'],
        ['thisIsARandomTest', 'this-is-a-random-test']
    ])('Value %s', (field, expected) => {
        expect(camelCaseToHyphenated(field)).toBe(expected);
    });
});