import { FAST_TEST_TIMINGS } from './fastTestTimings';

// This project is not aliased, so it reads the constant every published bundle reads. The behavioural
// suite replaces the module, so nothing over there can catch the flag shipping as `true`.
test('the shipped flag is false, so real builds keep the real delays', () => {
    expect(FAST_TEST_TIMINGS).toBe(false);
});
