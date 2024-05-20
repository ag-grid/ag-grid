import { MD5 } from './md5';

describe('MD5', () => {
    test('should return valid MD5 hash', () => {
        const result = new MD5().md5('test value');

        expect(result).toBe('cc2d2adc8b1da820c1075a099866ceb4');
    });
});
