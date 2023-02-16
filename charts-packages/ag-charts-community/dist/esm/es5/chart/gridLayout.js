var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
export function gridLayout(_a) {
    var orientation = _a.orientation, bboxes = _a.bboxes, maxHeight = _a.maxHeight, maxWidth = _a.maxWidth, _b = _a.itemPaddingY, itemPaddingY = _b === void 0 ? 0 : _b, _c = _a.itemPaddingX, itemPaddingX = _c === void 0 ? 0 : _c, _d = _a.forceResult, forceResult = _d === void 0 ? false : _d;
    var horizontal = orientation === 'horizontal';
    var primary = {
        max: horizontal ? maxWidth : maxHeight,
        fn: horizontal ? function (b) { return b.width; } : function (b) { return b.height; },
        padding: horizontal ? itemPaddingX : itemPaddingY,
    };
    var secondary = {
        max: !horizontal ? maxWidth : maxHeight,
        fn: !horizontal ? function (b) { return b.width; } : function (b) { return b.height; },
        padding: !horizontal ? itemPaddingX : itemPaddingY,
    };
    var processedBBoxCount = 0;
    var rawPages = [];
    while (processedBBoxCount < bboxes.length) {
        var unprocessedBBoxes = bboxes.slice(processedBBoxCount);
        var result = processBBoxes(unprocessedBBoxes, processedBBoxCount, primary, secondary, forceResult);
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
    var minGuess = 1;
    var startingGuess = estimateStartingGuess(bboxes, primary);
    if (startingGuess < minGuess) {
        if (!forceResult) {
            return undefined;
        }
        // Legend constraints too small! Display at least one row/column if forceResult is true
        startingGuess = minGuess;
    }
    for (var guess = startingGuess; guess >= minGuess; guess--) {
        var pageIndices = calculatePage(bboxes, indexOffset, guess, primary, secondary, forceResult);
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
        var processedBBoxCount = pageIndices.length * pageIndices[0].length; // this is an estimate, not all rows/columns will have the same length
        return { processedBBoxCount: processedBBoxCount, pageIndices: pageIndices };
    }
}
function calculatePage(bboxes, indexOffset, primaryCount, primary, secondary, forceResult) {
    var _a;
    var result = [];
    var sumSecondary = 0;
    var currentMaxSecondary = 0;
    var currentPrimaryIndices = [];
    var maxPrimaryValues = [];
    for (var bboxIndex = 0; bboxIndex < bboxes.length; bboxIndex++) {
        var primaryValueIdx = (bboxIndex + primaryCount) % primaryCount;
        if (primaryValueIdx === 0) {
            sumSecondary += currentMaxSecondary;
            currentMaxSecondary = 0;
            if (currentPrimaryIndices.length > 0) {
                result.push(currentPrimaryIndices);
            }
            currentPrimaryIndices = [];
        }
        var primaryValue = primary.fn(bboxes[bboxIndex]) + primary.padding;
        maxPrimaryValues[primaryValueIdx] = Math.max((_a = maxPrimaryValues[primaryValueIdx]) !== null && _a !== void 0 ? _a : 0, primaryValue);
        currentMaxSecondary = Math.max(currentMaxSecondary, secondary.fn(bboxes[bboxIndex]) + secondary.padding);
        var currentSecondaryDimension = sumSecondary + currentMaxSecondary;
        var returnResult = !forceResult || result.length > 0;
        if (currentSecondaryDimension > secondary.max && returnResult) {
            // Breached max secondary dimension size, return indices accumlated so far (but not in-progress row/column).
            currentPrimaryIndices = [];
            break;
        }
        var sumPrimary = maxPrimaryValues.reduce(function (sum, next) { return sum + next; }, 0);
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
    var maxPageWidth = 0;
    var maxPageHeight = 0;
    var pages = rawPages.map(function (indices) {
        if (orientation === 'horizontal') {
            indices = transpose(indices);
        }
        var endIndex = 0;
        var columns = indices.map(function (colIndices) {
            var colBBoxes = colIndices.map(function (bboxIndex) {
                endIndex = Math.max(bboxIndex, endIndex);
                return bboxes[bboxIndex];
            });
            var columnHeight = 0;
            var columnWidth = 0;
            colBBoxes.forEach(function (bbox) {
                columnHeight += bbox.height + itemPaddingY;
                columnWidth = Math.max(columnWidth, bbox.width + itemPaddingX);
            });
            return {
                indices: colIndices,
                bboxes: colBBoxes,
                columnHeight: columnHeight,
                columnWidth: columnWidth,
            };
        });
        var pageWidth = 0;
        var pageHeight = 0;
        columns.forEach(function (column) {
            pageWidth += column.columnWidth;
            pageHeight = Math.max(pageHeight, column.columnHeight);
        });
        maxPageWidth = Math.max(pageWidth, maxPageWidth);
        maxPageHeight = Math.max(pageHeight, maxPageHeight);
        return {
            columns: columns,
            startIndex: indices[0][0],
            endIndex: endIndex,
            pageWidth: pageWidth,
            pageHeight: pageHeight,
        };
    });
    return { pages: pages, maxPageWidth: maxPageWidth, maxPageHeight: maxPageHeight };
}
function transpose(data) {
    var e_1, _a;
    var result = [];
    try {
        for (var _b = __values(data[0]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _ = _c.value;
            result.push([]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    data.forEach(function (innerData, dataIdx) {
        innerData.forEach(function (item, itemIdx) {
            result[itemIdx][dataIdx] = item;
        });
    });
    return result;
}
function estimateStartingGuess(bboxes, primary) {
    var n = bboxes.length;
    var primarySum = 0;
    for (var bboxIndex = 0; bboxIndex < n; bboxIndex++) {
        primarySum += primary.fn(bboxes[bboxIndex]) + primary.padding;
        if (primarySum > primary.max) {
            var ratio = n / bboxIndex;
            if (ratio < 2) {
                return Math.ceil(n / 2);
            }
            return bboxIndex;
        }
    }
    return n;
}
