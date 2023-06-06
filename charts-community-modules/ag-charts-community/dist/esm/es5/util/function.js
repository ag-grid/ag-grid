var doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 */
export function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
/** Clear doOnce() state (for test purposes). */
export function clearDoOnceFlags() {
    for (var key in doOnceFlags) {
        delete doOnceFlags[key];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9mdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFNLFdBQVcsR0FBK0IsRUFBRSxDQUFDO0FBRW5EOztHQUVHO0FBQ0gsTUFBTSxVQUFVLE1BQU0sQ0FBQyxJQUFnQixFQUFFLEdBQVc7SUFDaEQsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbEIsT0FBTztLQUNWO0lBRUQsSUFBSSxFQUFFLENBQUM7SUFDUCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzVCLENBQUM7QUFFRCxnREFBZ0Q7QUFDaEQsTUFBTSxVQUFVLGdCQUFnQjtJQUM1QixLQUFLLElBQU0sR0FBRyxJQUFJLFdBQVcsRUFBRTtRQUMzQixPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMzQjtBQUNMLENBQUMifQ==