import { cloneObject, deepCloneDefinition, mergeDeep } from './object';

describe('object', () => {
    test('mergeDeep does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        const victim = {};
        try {
            mergeDeep(victim, BAD_JSON);
        } catch (e) {
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });

    test('cloneObject does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        let victim = {};
        try {
            victim = cloneObject(BAD_JSON);
        } catch (e) {
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });

    test('deepCloneDefinition does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        let victim = {};
        try {
            victim = deepCloneDefinition(BAD_JSON);
        } catch (e) {
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });
});
