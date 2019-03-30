import scaleLinear from "./linearScale";

test('domain', () => {
   const scale = scaleLinear();

   expect(scale.domain).toEqual([0, 1]);
   scale.domain = [5, 10];
   expect(scale.domain).toEqual([5, 10]);
});

test('range', () => {
    const scale = scaleLinear();

    expect(scale.range).toEqual([0, 1]);
    scale.range = [5, 10];
    expect(scale.range).toEqual([5, 10]);
});

test('convert linear', () => {
    const scale = scaleLinear();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.convert(-100)).toBe(0);
    expect(scale.convert(0)).toBe(50);
    expect(scale.convert(100)).toBe(100);

    // non-clamping
    expect(scale.convert(-300)).toBe(-100);
    expect(scale.convert(300)).toBe(200);
});

test('convert linear clamp', () => {
    const scale = scaleLinear();

    scale.domain = [-100, 100];
    scale.range = [0, 100];
    scale.clamp = true;

    expect(scale.convert(-300)).toBe(0);
    expect(scale.convert(300)).toBe(100);
});

test('invert linear', () => {
    const scale = scaleLinear();

    scale.domain = [-100, 100];
    scale.range = [0, 100];

    expect(scale.invert(50)).toBe(0);
    expect(scale.invert(0)).toBe(-100);
    expect(scale.invert(75)).toBe(50);

    // non-clamping
    expect(scale.invert(-50)).toBe(-200);
    expect(scale.invert(150)).toBe(200);
});

test('invert linear clamp', () => {
    const scale = scaleLinear();

    scale.domain = [-100, 100];
    scale.range = [0, 100];
    scale.clamp = true;

    expect(scale.invert(-50)).toBe(-100);
    expect(scale.invert(150)).toBe(100);
});
// TODO: re-enable when we start using polylinear scales in the wild
// test('convert polylinear', () => {
//     const scale = scaleLinear();
//
//     scale.domain = [-1, 0, 1];
//     scale.range = [0, 100, 300];
//
//     expect(scale.convert(-1)).toBe(0);
//     expect(scale.convert(-0.5)).toBe(50);
//     expect(scale.convert(0)).toBe(100);
//     expect(scale.convert(0.5)).toBe(200);
//     expect(scale.convert(1)).toBe(300);
// });
//
// test('invert polylinear', () => {
//     const scale = scaleLinear();
//
//     scale.domain = [-1, 0, 1];
//     scale.range = [0, 100, 300];
//
//     expect(scale.invert(50)).toBe(-0.5);
//     expect(scale.invert(100)).toBe(0);
//     expect(scale.invert(300)).toBe(1);
//     expect(scale.invert(200)).toBe(0.5);
//     expect(scale.invert(250)).toBe(0.75);
// });
