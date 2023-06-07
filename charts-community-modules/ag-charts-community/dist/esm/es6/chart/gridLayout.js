export function gridLayout({ orientation, bboxes, maxHeight, maxWidth, itemPaddingY = 0, itemPaddingX = 0, forceResult = false, }) {
    const horizontal = orientation === 'horizontal';
    const primary = {
        max: horizontal ? maxWidth : maxHeight,
        fn: horizontal ? (b) => b.width : (b) => b.height,
        padding: horizontal ? itemPaddingX : itemPaddingY,
    };
    const secondary = {
        max: !horizontal ? maxWidth : maxHeight,
        fn: !horizontal ? (b) => b.width : (b) => b.height,
        padding: !horizontal ? itemPaddingX : itemPaddingY,
    };
    let processedBBoxCount = 0;
    const rawPages = [];
    while (processedBBoxCount < bboxes.length) {
        const unprocessedBBoxes = bboxes.slice(processedBBoxCount);
        const result = processBBoxes(unprocessedBBoxes, processedBBoxCount, primary, secondary, forceResult);
        if (!result) {
            return;
        }
        processedBBoxCount += result.processedBBoxCount;
        rawPages.push(result.pageIndices);
    }
    return buildPages(rawPages, orientation, bboxes, itemPaddingY, itemPaddingX);
}
function processBBoxes(bboxes, indexOffset, primary, secondary, forceResult) {
    // If calculatePage() fails on the first guess, we could use the number of items that fit
    // as a good guess for the next iteration.
    const minGuess = 1;
    let startingGuess = estimateStartingGuess(bboxes, primary);
    if (startingGuess < minGuess) {
        if (!forceResult) {
            return undefined;
        }
        // Legend constraints too small! Display at least one row/column if forceResult is true
        startingGuess = minGuess;
    }
    for (let guess = startingGuess; guess >= minGuess; guess--) {
        const pageIndices = calculatePage(bboxes, indexOffset, guess, primary, secondary, forceResult);
        if (pageIndices == null && guess <= minGuess) {
            // Can't layout!
            return undefined;
        }
        if (pageIndices == null) {
            // Guess again!
            continue;
        }
        if (typeof pageIndices === 'number') {
            // calculatePage() suggested a better guess, use that if it's more than minGuess.
            if (pageIndices <= minGuess) {
                // Can't layout!
                return undefined;
            }
            guess = pageIndices < guess && pageIndices > minGuess ? pageIndices : guess;
            continue;
        }
        const processedBBoxCount = pageIndices.length * pageIndices[0].length; // this is an estimate, not all rows/columns will have the same length
        return { processedBBoxCount, pageIndices };
    }
}
function calculatePage(bboxes, indexOffset, primaryCount, primary, secondary, forceResult) {
    var _a;
    const result = [];
    let sumSecondary = 0;
    let currentMaxSecondary = 0;
    let currentPrimaryIndices = [];
    const maxPrimaryValues = [];
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
        maxPrimaryValues[primaryValueIdx] = Math.max((_a = maxPrimaryValues[primaryValueIdx]) !== null && _a !== void 0 ? _a : 0, primaryValue);
        currentMaxSecondary = Math.max(currentMaxSecondary, secondary.fn(bboxes[bboxIndex]) + secondary.padding);
        const currentSecondaryDimension = sumSecondary + currentMaxSecondary;
        const returnResult = !forceResult || result.length > 0;
        if (currentSecondaryDimension > secondary.max && returnResult) {
            // Breached max secondary dimension size, return indices accumlated so far (but not in-progress row/column).
            currentPrimaryIndices = [];
            break;
        }
        const sumPrimary = maxPrimaryValues.reduce((sum, next) => sum + next, 0);
        if (sumPrimary > primary.max && !forceResult) {
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
function buildPages(rawPages, orientation, bboxes, itemPaddingY, itemPaddingX) {
    let maxPageWidth = 0;
    let maxPageHeight = 0;
    const pages = rawPages.map((indices) => {
        if (orientation === 'horizontal') {
            indices = transpose(indices);
        }
        let endIndex = 0;
        const columns = indices.map((colIndices) => {
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
            pageWidth += column.columnWidth;
            pageHeight = Math.max(pageHeight, column.columnHeight);
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
function transpose(data) {
    const result = [];
    for (const _ of data[0]) {
        result.push([]);
    }
    data.forEach((innerData, dataIdx) => {
        innerData.forEach((item, itemIdx) => {
            result[itemIdx][dataIdx] = item;
        });
    });
    return result;
}
function estimateStartingGuess(bboxes, primary) {
    const n = bboxes.length;
    let primarySum = 0;
    for (let bboxIndex = 0; bboxIndex < n; bboxIndex++) {
        primarySum += primary.fn(bboxes[bboxIndex]) + primary.padding;
        if (primarySum > primary.max) {
            const ratio = n / bboxIndex;
            if (ratio < 2) {
                return Math.ceil(n / 2);
            }
            return bboxIndex;
        }
    }
    return n;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZExheW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydC9ncmlkTGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVlBLE1BQU0sVUFBVSxVQUFVLENBQUMsRUFDdkIsV0FBVyxFQUNYLE1BQU0sRUFDTixTQUFTLEVBQ1QsUUFBUSxFQUNSLFlBQVksR0FBRyxDQUFDLEVBQ2hCLFlBQVksR0FBRyxDQUFDLEVBQ2hCLFdBQVcsR0FBRyxLQUFLLEdBU3RCO0lBQ0csTUFBTSxVQUFVLEdBQUcsV0FBVyxLQUFLLFlBQVksQ0FBQztJQUNoRCxNQUFNLE9BQU8sR0FBbUI7UUFDNUIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3RDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDN0QsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZO0tBQ3BELENBQUM7SUFDRixNQUFNLFNBQVMsR0FBbUI7UUFDOUIsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDdkMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzlELE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZO0tBQ3JELENBQUM7SUFFRixJQUFJLGtCQUFr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