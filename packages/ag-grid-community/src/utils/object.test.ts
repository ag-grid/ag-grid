import { _mergeDeep } from './object';

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
});
