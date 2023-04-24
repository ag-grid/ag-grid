import { NumberSequence } from "./numberSequence";

describe('NumberSequence', () => {
    it('returns default incrementing sequence', () => {
        const sequence = new NumberSequence();

        expect(sequence.next()).toBe(0);
        expect(sequence.next()).toBe(1);
        expect(sequence.next()).toBe(2);
        expect(sequence.next()).toBe(3);
        expect(sequence.next()).toBe(4);
    });

    it('can use different start number', () => {
        const sequence = new NumberSequence(28);

        expect(sequence.next()).toBe(28);
        expect(sequence.next()).toBe(29);
    });

    it('can use different step', () => {
        const sequence = new NumberSequence(0, 5);

        expect(sequence.next()).toBe(0);
        expect(sequence.next()).toBe(5);
        expect(sequence.next()).toBe(10);
    });

    it('can peek without affecting value', () => {
        const sequence = new NumberSequence();

        expect(sequence.peek()).toBe(0);
        expect(sequence.next()).toBe(0);
        expect(sequence.peek()).toBe(1);
        expect(sequence.next()).toBe(1);
    });

    it('skips a given number', () => {
        const sequence = new NumberSequence();

        expect(sequence.next()).toBe(0);

        sequence.skip(5);

        expect(sequence.next()).toBe(6);
    });
});