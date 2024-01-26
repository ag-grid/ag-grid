/**
 * Compute a set of quantiles for a given set of numeric values
 * @param values Set of numeric values over which to compute quantiles
 * @param buckets Key/value object containing quantile definitions
 * @returns Key/value object containing corresponding quantile values
 * @example
 * const data = [1, 2, 3, 4, 5];
 * const { min, q1, median, q3, max } = quantiles(data, {
 *   min: 0,
 *   q1: 0.25,
 *   median: 0.5,
 *   q3: 0.75,
 *   max: 1,
 * });
 */
export function quantiles<T extends { [key: string]: number }>(
    values: Array<number>,
    buckets: T
): { [K in keyof T]: number } {
    // Arrange all values in ascending order, cloning the original array to avoid unwanted mutations
    const sortedValues = [...values].sort((a, b) => a - b);
    // Compute quantiles for each of the specified buckets
    const bucketDefinitions = Object.entries(buckets) as Array<[keyof T, number]>;
    return bucketDefinitions
        .map(([key, quantile]): [keyof T, number] => {
            // Determine the exact value of the quantile dividing line within the sorted data set
            const quantilePosition = (sortedValues.length - 1) * quantile;
            // Determine the two values that straddle the exact quantile value
            const index = Math.floor(quantilePosition);
            const belowValue = sortedValues[index];
            const aboveValue = index === sortedValues.length - 1 ? belowValue : sortedValues[index + 1];
            // Return a linear interpolation of the two values
            const value = belowValue + (quantilePosition - index) * (aboveValue - belowValue);
            return [key, value];
        })
        // Combine all the results into a single key/value object
        .reduce((results, [key, value]) => {
            results[key] = value;
            return results;
        }, {} as Record<keyof T, number>);
}
