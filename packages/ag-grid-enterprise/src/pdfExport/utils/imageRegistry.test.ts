import { PdfImageRegistry, constrainImageWidth } from './imageRegistry';

// 3x2 greyscale JPEG accepted by the decoder without pixel decoding.
const JPEG_BYTES = Uint8Array.from([
    0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00, 0x03, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9,
]);
const JPEG_BASE64 = btoa(String.fromCharCode(...JPEG_BYTES));

describe('PdfImageRegistry', () => {
    it('derives the missing dimension from the intrinsic aspect ratio and applies defaults', () => {
        const registry = new PdfImageRegistry();

        const image = registry.resolve({ id: 'logo', base64: JPEG_BASE64, imageType: 'jpg', width: 30 });

        expect(image.width).toBe(30);
        expect(image.height).toBeCloseTo(20, 5);
        expect(image.alignment).toBe('start');
        expect(image.gap).toBe(4);
    });

    it('shares one decoded resource per image id', () => {
        const registry = new PdfImageRegistry();

        const first = registry.resolve({ id: 'logo', base64: JPEG_BASE64, imageType: 'jpg' });
        const second = registry.resolve({ id: 'logo', base64: JPEG_BASE64, imageType: 'jpg', width: 9 });

        expect(second.resource).toBe(first.resource);
        expect(second.width).toBe(9);
        expect(registry.getResources()).toHaveLength(1);
    });

    it('scales constrained images without changing their aspect ratio', () => {
        const registry = new PdfImageRegistry();
        const image = registry.resolve({ id: 'logo', base64: JPEG_BASE64, imageType: 'jpg', width: 30 });

        const constrained = constrainImageWidth(image, 15);

        expect(constrained.width).toBe(15);
        expect(constrained.height).toBeCloseTo(10, 5);
    });

    it('rejects an empty image id', () => {
        const registry = new PdfImageRegistry();

        expect(() => registry.resolve({ id: ' ', base64: JPEG_BASE64, imageType: 'jpg' })).toThrow(
            'AG Grid: PDF images require a non-empty id.'
        );
    });

    it('rejects a data URL whose type contradicts the declared imageType', () => {
        const registry = new PdfImageRegistry();

        expect(() =>
            registry.resolve({ id: 'logo', base64: `data:image/png;base64,${JPEG_BASE64}`, imageType: 'jpg' })
        ).toThrow('is a "png" data URL but its imageType is "jpg"');
        expect(() =>
            registry.resolve({ id: 'logo', base64: `data:image/jpeg;base64,${JPEG_BASE64}`, imageType: 'jpg' })
        ).not.toThrow();
    });
});
