import { _cloneObject, _deepCloneDefinition, _mergeDeep } from './object';

describe('object', () => {
    test('_mergeDeep does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        const victim = {};
        try {
            _mergeDeep(victim, BAD_JSON);
        } catch (e) {
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });

    test('_cloneObject does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        let victim = {};
        try {
            victim = _cloneObject(BAD_JSON);
        } catch (e) {
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });

    test('_deepCloneDefinition does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        let victim = {};
        try {
            victim = _deepCloneDefinition(BAD_JSON);
        } catch (e) {
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });
});
