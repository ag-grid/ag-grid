var twoPi = Math.PI * 2;
/**
 * Normalize the given angle to be in the [0, 2π) interval.
 * @param radians Angle in radians.
 */
export function normalizeAngle360(radians) {
    radians %= twoPi;
    radians += twoPi;
    radians %= twoPi;
    return radians;
}
export function normalizeAngle360Inclusive(radians) {
    radians %= twoPi;
    radians += twoPi;
    if (radians !== twoPi) {
        radians %= twoPi;
    }
    return radians;
}
/**
 * Normalize the given angle to be in the [-π, π) interval.
 * @param radians Angle in radians.
 */
export function normalizeAngle180(radians) {
    radians %= twoPi;
    if (radians < -Math.PI) {
        radians += twoPi;
    }
    else if (radians >= Math.PI) {
        radians -= twoPi;
    }
    return radians;
}
export function toRadians(degrees) {
    return (degrees / 180) * Math.PI;
}
export function toDegrees(radians) {
    return (radians / Math.PI) * 180;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5nbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9hbmdsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUUxQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsT0FBZTtJQUM3QyxPQUFPLElBQUksS0FBSyxDQUFDO0lBQ2pCLE9BQU8sSUFBSSxLQUFLLENBQUM7SUFDakIsT0FBTyxJQUFJLEtBQUssQ0FBQztJQUNqQixPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBRUQsTUFBTSxVQUFVLDBCQUEwQixDQUFDLE9BQWU7SUFDdEQsT0FBTyxJQUFJLEtBQUssQ0FBQztJQUNqQixPQUFPLElBQUksS0FBSyxDQUFDO0lBQ2pCLElBQUksT0FBTyxLQUFLLEtBQUssRUFBRTtRQUNuQixPQUFPLElBQUksS0FBSyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxPQUFlO0lBQzdDLE9BQU8sSUFBSSxLQUFLLENBQUM7SUFDakIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQ3BCLE9BQU8sSUFBSSxLQUFLLENBQUM7S0FDcEI7U0FBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO1FBQzNCLE9BQU8sSUFBSSxLQUFLLENBQUM7S0FDcEI7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxPQUFlO0lBQ3JDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxPQUFlO0lBQ3JDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNyQyxDQUFDIn0=