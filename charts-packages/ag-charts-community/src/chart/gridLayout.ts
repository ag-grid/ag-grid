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
}): { pages: Page[]; maxPageWidth: number; maxPageHeight: number } | undefined {
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
        // If calculatePage() fails on the first guess, we could use the number of items that fit
        // as a good guess for the next iteration.
        const unprocessedBBoxes = bboxes.slice(processedBBoxCount);
        const minGuess = 1;
        const startingGuess = estimateStartingGuess(unprocessedBBoxes, primary);

        if (startingGuess < minGuess) {
            return;
        }

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
                if (pageIndices === minGuess) {
                    processedBBoxCount = bboxes.length;
                    break;
                }

                guess = pageIndices < guess && pageIndices > minGuess ? pageIndices : guess;
                continue;
            }

            processedBBoxCount += pageIndices.length * pageIndices[0].length; // this is an estimate, not all rows/columns will have the same length
            rawPages.push(pageIndices);
            break;
        }
    }

    // rawPages[pageNumber][secondaryDim][primaryDim]

    if (rawPages.length === 0) {
        return;
    }

    return buildPages(rawPages, orientation, bboxes, itemPaddingY, itemPaddingX);
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
): number[][] | undefined | number {
    const result: number[][] = [];

    let sumSecondary = 0;
    let currentMaxSecondary = 0;

    let currentPrimaryIndices: number[] = [];
    let maxPrimaryValues: number[] = [];
    for (let bboxIndex = 0; bboxIndex < bboxes.length; bboxIndex++) {
        const primaryValueIdx = (bboxIndex + primaryCount) % primaryCount;
        if (primaryValueIdx === 0) {
            sumSecondary += currentMaxSecondary;
            currentMaxSecondary = 0;

            if (currentPrimaryIndices.length > 0) {
                result.push(currentPrimaryIndices);
            }
            currentPrimaryIndices = [];
        }

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

function buildPages(
    rawPages: number[][][],
    orientation: Orientation,
    bboxes: BBox[],
    itemPaddingY: number,
    itemPaddingX: number
): { pages: Page[]; maxPageWidth: number; maxPageHeight: number } {
    let maxPageWidth = 0;
    let maxPageHeight = 0;
    const pages = rawPages.map((indices): Page => {
        if (orientation === Orientation.Horizontal) {
            indices = transpose(indices);
        }

        let endIndex = 0;
        const columns = indices.map((colIndices): Column => {
            const colBBoxes = colIndices.map((bboxIndex) => {
                endIndex = Math.max(bboxIndex, endIndex);
                return bboxes[bboxIndex];
            });
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

        maxPageWidth = Math.max(pageWidth, maxPageWidth);
        maxPageHeight = Math.max(pageHeight, maxPageHeight);

        return {
            columns,
            startIndex: indices[0][0],
            endIndex,
            pageWidth,
            pageHeight,
        };
    });

    return { pages, maxPageWidth, maxPageHeight };
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

function estimateStartingGuess(bboxes: BBox[], primary: DimensionProps): number {
    const n = bboxes.length;
    let primarySum = 0;
    for (let bboxIndex = 0; bboxIndex < n; bboxIndex++) {
        primarySum += primary.fn(bboxes[bboxIndex]) + primary.padding;

        if (primarySum > primary.max) {
            const ratio = n / bboxIndex;
            if (ratio < 2) {
                return n / 2;
            }
            return bboxIndex;
        }
    }

    return n;
}
