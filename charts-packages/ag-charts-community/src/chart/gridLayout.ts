import { BBox } from '../scene/bbox';

export type Page = { columns: Column[]; pageWidth: number; pageHeight: number; startIndex: number; endIndex: number };

export enum Orientation {
    Vertical,
    Horizontal,
}

type Column = {
    columnWidth: number;
    columnHeight: number;
    indices: number[];
    bboxes: BBox[];
};
export type Grid = { [column: number]: Column };

export function gridLayout({
    orientation,
    bboxes,
    maxHeight,
    maxWidth,
    itemPaddingY = 0,
    itemPaddingX = 0,
}: {
    orientation: Orientation;
    bboxes: BBox[];
    maxHeight: number;
    maxWidth: number;
    itemPaddingY?: number;
    itemPaddingX?: number;
}): { pages: Page[] } | undefined {
    const horizontal = orientation === Orientation.Horizontal;
    const primary: DimensionProps = {
        max: horizontal ? maxWidth : maxHeight,
        fn: horizontal ? (b: BBox) => b.width : (b: BBox) => b.height,
        padding: horizontal ? itemPaddingX : itemPaddingY,
    };
    const secondary: DimensionProps = {
        max: !horizontal ? maxWidth : maxHeight,
        fn: !horizontal ? (b: BBox) => b.width : (b: BBox) => b.height,
        padding: !horizontal ? itemPaddingX : itemPaddingY,
    };

    let processedBBoxCount = 0;
    const rawPages: number[][][] = [];
    while (processedBBoxCount < bboxes.length) {
        // If calculatePage() fails on the first row, we could use the number of items that fit
        // as a good guess for the next iteration.
        // separate function for guess calculation (loop through bboxes, use dimension functions)
        const startingGuess = 10;
        const minGuess = 1;
        const unprocessedBBoxes = bboxes.slice(processedBBoxCount);

        for (let guess = startingGuess; guess >= minGuess; guess--) {
            const pageIndices = calculatePage(unprocessedBBoxes, processedBBoxCount, guess, primary, secondary);

            if (pageIndices == null && guess <= minGuess) {
                // Can't layout!
                return undefined;
            }

            if (pageIndices == null) {
                // Guess again!
                continue;
            }

            if (typeof pageIndices === 'number') {
                // calculatePage() suggested a better guess, use that.
                guess = pageIndices < guess ? pageIndices : guess;
                continue;
            }

            processedBBoxCount += pageIndices.length * pageIndices[0].length;
            rawPages.push(pageIndices);
            break;
        }
    }

    const pages = rawPages.map((indices): Page => {
        if (orientation === Orientation.Horizontal) {
            indices = transpose(indices);
        }

        const lastIndices = indices[indices.length - 1];
        const columns = indices.map((colIndices): Column => {
            const colBBoxes = colIndices.map((bboxIndex) => bboxes[bboxIndex]);
            let columnHeight = 0;
            let columnWidth = 0;
            colBBoxes.forEach((bbox) => {
                columnHeight += bbox.height + itemPaddingY;
                columnWidth = Math.max(columnWidth, bbox.width + itemPaddingX);
            });
            return {
                indices: colIndices,
                bboxes: colBBoxes,
                columnHeight,
                columnWidth,
            };
        });

        let pageWidth = 0;
        let pageHeight = 0;
        columns.forEach((column) => {
            (pageWidth += column.columnWidth), (pageHeight = Math.max(pageHeight, column.columnHeight));
        });

        return {
            columns,
            startIndex: indices[0][0],
            endIndex: lastIndices[lastIndices.length - 1],
            pageWidth,
            pageHeight,
        };
    });

    return { pages };

    // pages[pageNumber][secondaryDim][primaryDim]

    // 0 1  2  3   12 13 14 15 16
    // 4 5  6  7   12 13 14 15 16
    // 8 9 10 11

    // 0  4   8
    // 1  5   9
    // 2  6  10
    // 3  7  11

    // 12 16 20
    // 13 17 21
}

interface DimensionProps {
    max: number;
    fn: (bbox: BBox) => number;
    padding: number;
}

function calculatePage(
    bboxes: BBox[],
    indexOffset: number,
    primaryCount: number,
    primary: DimensionProps,
    secondary: DimensionProps
) {
    const result: number[][] = [];

    let sumSecondary = 0;
    let currentMaxSecondary = 0;

    let currentPrimaryIndices: number[] = [];
    let maxPrimaryValues: number[] = [];
    for (let bboxIndex = 0; bboxIndex < bboxes.length; bboxIndex++) {
        if (bboxIndex % primaryCount === 0) {
            sumSecondary += currentMaxSecondary;
            currentMaxSecondary = 0;

            if (currentPrimaryIndices.length > 0) {
                result.push(currentPrimaryIndices);
            }
            currentPrimaryIndices = [];
        }

        const primaryValueIdx = bboxIndex % primaryCount;
        const primaryValue = primary.fn(bboxes[bboxIndex]) + primary.padding;
        maxPrimaryValues[primaryValueIdx] = Math.max(maxPrimaryValues[primaryValueIdx] ?? 0, primaryValue);
        currentMaxSecondary = Math.max(currentMaxSecondary, secondary.fn(bboxes[bboxIndex]) + secondary.padding);

        const currentSecondaryDimension = sumSecondary + currentMaxSecondary;
        if (currentSecondaryDimension > secondary.max) {
            // Breached max secondary dimension size, return indices accumlated so far (but not in-progress row/column).
            currentPrimaryIndices = [];
            break;
        }

        const sumPrimary = maxPrimaryValues.reduce((sum, next) => sum + next, 0);
        if (sumPrimary > primary.max) {
            // Breached max main dimension size.
            if (maxPrimaryValues.length < primaryCount) {
                // Feedback as guess for next iteration if we're on the first round still.
                return maxPrimaryValues.length;
            }
            return undefined;
        }

        currentPrimaryIndices.push(bboxIndex + indexOffset);
    }

    if (currentPrimaryIndices.length > 0) {
        result.push(currentPrimaryIndices);
    }

    return result.length > 0 ? result : undefined;
}

function transpose(data: number[][]) {
    const result: number[][] = [];
    for (let i = 0; i < data[0].length; i++) {
        result.push([]);
    }

    data.forEach((innerData, dataIdx) => {
        innerData.forEach((item, itemIdx) => {
            result[itemIdx][dataIdx] = item;
        });
    });

    return result;
}
