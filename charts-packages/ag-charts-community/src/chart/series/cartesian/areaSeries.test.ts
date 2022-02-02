import { describe, expect, test } from '@jest/globals';

type Coordinate = { x: number; y: number };
type Segment = { yKey: string; points: Coordinate[] };
type CumulativeValue = { left: number; right: number };

function createSelectionData(xData: any[], yData: any[], yKeys: string[]): any[] {
    const makeCumVal = () => new Array(xData.length)
        .fill(null)
        .map(() => ({ left: 0, right: 0 }));

    const fillSelectionData = [];
    const cumulativePositiveValues: CumulativeValue[] = makeCumVal();
    const cumulativeNegativeValues: CumulativeValue[] = makeCumVal();

    console.log({ cumulativePositiveValues, cumulativeNegativeValues });

    function createCoordinates(
        cumulativeValues: CumulativeValue[],
        xValue: number,
        yValue: number,
        idx: number,
        side: keyof CumulativeValue
    ): [Coordinate, Coordinate] {
        const lowY = cumulativeValues[idx][side];
        const highY = cumulativeValues[idx][side] + yValue;

        cumulativeValues[idx][side] = cumulativeValues[idx][side] + yValue;

        return [
            { x: xValue, y: highY },
            { x: xValue, y: lowY },
        ];
    }

    const segments: Segment[] = [];
    yData.forEach((seriesYs, yIdx) => {
        seriesYs.forEach((yDatum, datumIdx) => {
            const windowX = [xData[datumIdx], xData[datumIdx + 1]];
            const windowY = [yDatum, seriesYs[datumIdx + 1]];

            if (windowX.some((v) => v == null)) {
                return;
            }
            if (windowY.some((v) => v == null)) {
                return;
            }

            const processWindowItem = (windowIdx) => {
                const cumulativeValues = windowY[windowIdx] >= 0 ? cumulativePositiveValues : cumulativeNegativeValues;
                const side = windowIdx === 0 ? 'right' : 'left';

                return createCoordinates(
                    cumulativeValues,
                    windowX[windowIdx],
                    windowY[windowIdx],
                    datumIdx + windowIdx,
                    side
                );
            };

            segments.push({ yKey: yKeys[yIdx], points: [...processWindowItem(0).reverse(), ...processWindowItem(1)] });
        });
    });

    segments.forEach(({ yKey, points }) => {
        fillSelectionData.push({ itemId: yKey, points });
    });

    return fillSelectionData;
}

describe('fillSelectionData', () => {
    test('segments no gaps, 1 series', () => {
        const xData = ['2009', '2010', '2011', '2012', '2013', '2014'];

        const yData = [
            [1, 2, 3, 4, 5, 6],
        ];

        const yKeys = ['series1'];

        const fillSelectionDataPoints = createSelectionData(xData, yData, yKeys).map((datum) => datum.points);

        expect(fillSelectionDataPoints).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "x": "2009",
                  "y": 0,
                },
                Object {
                  "x": "2009",
                  "y": 1,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2010",
                  "y": 0,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2011",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2011",
                  "y": 0,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2012",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2012",
                  "y": 0,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2013",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2013",
                  "y": 0,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2014",
                  "y": 6,
                },
                Object {
                  "x": "2014",
                  "y": 0,
                },
              ],
            ]
        `);
    });

    test('segments 1 gap, 1 series', () => {
        const xData = ['2009', '2010', '2011', '2012', '2013', '2014'];

        const yData = [[1, 2, undefined, 4, 5, 6]];

        const yKeys = ['series1'];

        const fillSelectionDataPoints = createSelectionData(xData, yData, yKeys).map((datum) => datum.points);

        console.log('fillSelectionData', fillSelectionDataPoints);

        expect(fillSelectionDataPoints).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "x": "2009",
                  "y": 0,
                },
                Object {
                  "x": "2009",
                  "y": 1,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2012",
                  "y": 0,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2013",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2013",
                  "y": 0,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2014",
                  "y": 6,
                },
                Object {
                  "x": "2014",
                  "y": 0,
                },
              ],
            ]
        `);
    });

    test('segments no gap, 2 series', () => {
        const xData = ['2009', '2010', '2011', '2012', '2013', '2014'];

        const yData = [
            [1, 2, 3, 4, 5, 6],
            [1, 2, 3, 4, 5, 6],
        ];

        const yKeys = ['series1'];

        const fillSelectionDataPoints = createSelectionData(xData, yData, yKeys).map((datum) => datum.points);

        console.log('fillSelectionData', fillSelectionDataPoints);

        expect(fillSelectionDataPoints).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "x": "2009",
                  "y": 0,
                },
                Object {
                  "x": "2009",
                  "y": 1,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2010",
                  "y": 0,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2011",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2011",
                  "y": 0,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2012",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2012",
                  "y": 0,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2013",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2013",
                  "y": 0,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2014",
                  "y": 6,
                },
                Object {
                  "x": "2014",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2009",
                  "y": 1,
                },
                Object {
                  "x": "2009",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 4,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
              ],
              Array [
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 4,
                },
                Object {
                  "x": "2011",
                  "y": 6,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
              ],
              Array [
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2011",
                  "y": 6,
                },
                Object {
                  "x": "2012",
                  "y": 8,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
              ],
              Array [
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2012",
                  "y": 8,
                },
                Object {
                  "x": "2013",
                  "y": 10,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
              ],
              Array [
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2013",
                  "y": 10,
                },
                Object {
                  "x": "2014",
                  "y": 12,
                },
                Object {
                  "x": "2014",
                  "y": 6,
                },
              ],
            ]
        `);
    });

    test('segments 1 gap, 2 series', () => {
        const xData = ['2009', '2010', '2011', '2012', '2013', '2014'];

        const yData = [
            [1, 2, undefined, 4, 5, 6],
            [1, 2, 3, 4, 5, 6],
        ];

        const yKeys = ['series1'];

        const fillSelectionDataPoints = createSelectionData(xData, yData, yKeys).map((datum) => datum.points);

        console.log('fillSelectionData', fillSelectionDataPoints);

        expect(fillSelectionDataPoints).toMatchInlineSnapshot(`
            Array [
              Array [
                Object {
                  "x": "2009",
                  "y": 0,
                },
                Object {
                  "x": "2009",
                  "y": 1,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2012",
                  "y": 0,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2013",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2013",
                  "y": 0,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2014",
                  "y": 6,
                },
                Object {
                  "x": "2014",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2009",
                  "y": 1,
                },
                Object {
                  "x": "2009",
                  "y": 2,
                },
                Object {
                  "x": "2010",
                  "y": 4,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
              ],
              Array [
                Object {
                  "x": "2010",
                  "y": 0,
                },
                Object {
                  "x": "2010",
                  "y": 2,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2011",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2011",
                  "y": 0,
                },
                Object {
                  "x": "2011",
                  "y": 3,
                },
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2012",
                  "y": 0,
                },
              ],
              Array [
                Object {
                  "x": "2012",
                  "y": 4,
                },
                Object {
                  "x": "2012",
                  "y": 8,
                },
                Object {
                  "x": "2013",
                  "y": 10,
                },
                Object {
                  "x": "2013",
                  "y": 5,
                },
              ],
              Array [
                Object {
                  "x": "2013",
                  "y": 5,
                },
                Object {
                  "x": "2013",
                  "y": 10,
                },
                Object {
                  "x": "2014",
                  "y": 12,
                },
                Object {
                  "x": "2014",
                  "y": 6,
                },
              ],
            ]
        `);
    });
});
