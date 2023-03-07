import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { BackgroundImage } from './backgroundImage';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { Chart } from './chart';
import { AgChart } from './agChartV2';
import {
    waitForChartStability,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    deproxy,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
} from './test/utils';

expect.extend({ toMatchImageSnapshot });

const SMALL_IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

describe('backgroundImage', () => {
    describe('Positioning', () => {
        const containerWidth = 300;
        const containerHeight = 200;
        const naturalWidth = 80;
        const naturalHeight = 50;

        const calculatePosition = (params: {
            left?: number;
            width?: number;
            right?: number;
            top?: number;
            height?: number;
            bottom?: number;
        }) => {
            const image = new BackgroundImage();

            Object.assign(image, params);

            image.performLayout(containerWidth, containerHeight);

            return image.calculatePosition(naturalWidth, naturalHeight);
        };

        it(`By default image has natural size and positioned at the center`, () => {
            const position = calculatePosition({});

            expect(position).toEqual({ x: 110, y: 75, width: 80, height: 50 });
        });

        it(`If left position specified, the image moves left`, () => {
            const position = calculatePosition({ left: 20 });

            expect(position).toEqual({ x: 20, y: 75, width: 80, height: 50 });
        });

        it(`If right position specified, the image moves right`, () => {
            const position = calculatePosition({ right: 20 });

            expect(position).toEqual({ x: 200, y: 75, width: 80, height: 50 });
        });

        it(`If right and left position specified, the image scratched`, () => {
            const position = calculatePosition({ left: 50, right: 50 });

            expect(position).toEqual({ x: 50, y: 37, width: 200, height: 125 });
        });

        it(`If width specified, the image scratched at the center`, () => {
            const position = calculatePosition({ width: 160 });

            expect(position).toEqual({ x: 70, y: 50, width: 160, height: 100 });
        });

        it(`If width and left specified, the image scratched and moved left`, () => {
            const position = calculatePosition({ left: 20, width: 160 });

            expect(position).toEqual({ x: 20, y: 50, width: 160, height: 100 });
        });

        it(`If width and right specified, the image scratched and moved right`, () => {
            const position = calculatePosition({ width: 160, right: 20 });

            expect(position).toEqual({ x: 120, y: 50, width: 160, height: 100 });
        });

        it(`If left, right and width specified, width ignored`, () => {
            const position = calculatePosition({ left: 50, width: 250, right: 50 });

            expect(position).toEqual({ x: 50, y: 37, width: 200, height: 125 });
        });

        it(`If top position specified, the image moves up`, () => {
            const position = calculatePosition({ top: 20 });

            expect(position).toEqual({ x: 110, y: 20, width: 80, height: 50 });
        });

        it(`If bottom position specified, the image moves down`, () => {
            const position = calculatePosition({ bottom: 20 });

            expect(position).toEqual({ x: 110, y: 130, width: 80, height: 50 });
        });

        it(`If top bottom position specified, the image starches`, () => {
            const position = calculatePosition({ top: 50, bottom: 50 });

            expect(position).toEqual({ x: 70, y: 50, width: 160, height: 100 });
        });

        it(`If height and top specified, the image scratches and moves up`, () => {
            const position = calculatePosition({ top: 20, height: 100 });

            expect(position).toEqual({ x: 70, y: 20, width: 160, height: 100 });
        });

        it(`If height and bottom specified, the image scratches`, () => {
            const position = calculatePosition({ height: 100, bottom: 20 });

            expect(position).toEqual({ x: 70, y: 80, width: 160, height: 100 });
        });

        it(`If top, bottom and height specified, height ignored`, () => {
            const position = calculatePosition({ top: 50, height: 350, bottom: 50 });

            expect(position).toEqual({ x: 70, y: 50, width: 160, height: 100 });
        });

        it(`If all sides specified, natural proportion ignored`, () => {
            const position = calculatePosition({ left: 50, top: 50, right: 50, bottom: 50 });

            expect(position).toEqual({ x: 50, y: 50, width: 200, height: 100 });
        });

        it(`Width and height specified, natural proportion ignored`, () => {
            const position = calculatePosition({ width: 200, height: 100 });

            expect(position).toEqual({ x: 50, y: 50, width: 200, height: 100 });
        });

        it(`Cross-axes: right and height`, () => {
            const position = calculatePosition({ right: 20, height: 100 });

            expect(position).toEqual({ x: 120, y: 50, width: 160, height: 100 });
        });

        it(`Cross-axes: bottom and width`, () => {
            const position = calculatePosition({ width: 160, bottom: 20 });

            expect(position).toEqual({ x: 70, y: 80, width: 160, height: 100 });
        });
    });

    describe('Rendering', () => {
        let chart: Chart;

        beforeEach(() => {
            console.warn = jest.fn();
        });

        afterEach(() => {
            if (chart) {
                chart.destroy();
                (chart as unknown) = undefined;
            }
            expect(console.warn).not.toBeCalled();
        });

        const ctx = setupMockCanvas();

        const compare = async (chart: Chart) => {
            await waitForChartStability(chart);

            const imageData = extractImageData(ctx);
            (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
        };

        it('Image in the center', async () => {
            const options = {
                title: { text: 'Background image in the center' },
                background: {
                    image: {
                        url: SMALL_IMAGE,
                        width: 100,
                        height: 100,
                        opacity: 1,
                    },
                },
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            };

            chart = deproxy(AgChart.create(options));

            await compare(chart);
        });

        it('Transparent image at right bottom corner with fill color', async () => {
            const options = {
                title: { text: 'Background image in the right bottom corner' },
                background: {
                    fill: 'silver',
                    image: {
                        url: SMALL_IMAGE,
                        width: 100,
                        height: 100,
                        right: 20,
                        bottom: 20,
                        opacity: 0.3,
                    },
                },
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            };

            chart = deproxy(AgChart.create(options));

            await compare(chart);
        });
    });
});
