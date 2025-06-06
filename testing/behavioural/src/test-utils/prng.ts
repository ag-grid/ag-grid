/** A simple non cryptographic seeded pseudorandom random number generator */
export class SimplePRNG {
    private a: number;
    private b: number;

    constructor(private readonly seed: number = 0x13d24a75) {
        this.reset(seed);
    }

    reset(seed: number = this.seed): this {
        this.a = seed >>> 0;
        this.b = 0x6d2b79f5;
        return this;
    }

    next(): number {
        let b = this.b;
        let x = (this.a += 0x6d2b79f5);
        b = Math.imul((b << 5) | (b >>> 27), 16807) + 4093;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        const r = (b ^ x ^ (x >>> 14)) >>> 0;
        this.b = b + (((r * 2957946851) ^ (x * 139)) >>> (r >>> 27));
        return r * 2.3283064365386963e-10;
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    nextFloat(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    nextString(length: number, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(this.nextInt(0, characters.length - 1));
        }
        return result;
    }

    /** Shuffle an array in place */
    shuffle<T>(array: T[], start: number = 0, end: number = array.length - 1): T[] {
        const len = array.length;
        if (start < 0) start = 0;
        if (end >= len) end = len - 1;
        if (end < 0 || start >= end) return array;
        for (let i = end; i > start; --i) {
            const j = this.nextInt(start, i);
            const tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
        }
        return array;
    }
}
