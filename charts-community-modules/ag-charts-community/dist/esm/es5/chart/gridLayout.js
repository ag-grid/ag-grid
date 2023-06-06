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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZExheW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydC9ncmlkTGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBWUEsTUFBTSxVQUFVLFVBQVUsQ0FBQyxFQWdCMUI7UUFmRyxXQUFXLGlCQUFBLEVBQ1gsTUFBTSxZQUFBLEVBQ04sU0FBUyxlQUFBLEVBQ1QsUUFBUSxjQUFBLEVBQ1Isb0JBQWdCLEVBQWhCLFlBQVksbUJBQUcsQ0FBQyxLQUFBLEVBQ2hCLG9CQUFnQixFQUFoQixZQUFZLG1CQUFHLENBQUMsS0FBQSxFQUNoQixtQkFBbUIsRUFBbkIsV0FBVyxtQkFBRyxLQUFLLEtBQUE7SUFVbkIsSUFBTSxVQUFVLEdBQUcsV0FBVyxLQUFLLFlBQVksQ0FBQztJQUNoRCxJQUFNLE9BQU8sR0FBbUI7UUFDNUIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3RDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQUMsQ0FBTyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEtBQUssRUFBUCxDQUFPLENBQUMsQ0FBQyxDQUFDLFVBQUMsQ0FBTyxJQUFLLE9BQUEsQ0FBQyxDQUFDLE1BQU0sRUFBUixDQUFRO1FBQzdELE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWTtLQUNwRCxDQUFDO0lBQ0YsSUFBTSxTQUFTLEdBQW1CO1FBQzlCLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3ZDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBQyxDQUFPLElBQUssT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFQLENBQU8sQ0FBQyxDQUFDLENBQUMsVUFBQyxDQUFPLElBQUssT0FBQSxDQUFDLENB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