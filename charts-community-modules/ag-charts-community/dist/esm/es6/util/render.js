var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export function debouncedAnimationFrame(cb) {
    return buildScheduler((cb) => requestAnimationFrame(cb), cb);
}
export function debouncedCallback(cb) {
    return buildScheduler((cb) => setTimeout(cb, 0), cb);
}
function buildScheduler(scheduleFn, cb) {
    let scheduleCount = 0;
    let promiseRunning = false;
    let awaitingPromise;
    let awaitingDone;
    const busy = () => {
        return promiseRunning;
    };
    const done = () => {
        promiseRunning = false;
        awaitingDone === null || awaitingDone === void 0 ? void 0 : awaitingDone();
        awaitingDone = undefined;
        awaitingPromise = undefined;
        if (scheduleCount > 0) {
            scheduleFn(scheduleCb);
        }
    };
    const scheduleCb = () => {
        const count = scheduleCount;
        scheduleCount = 0;
        promiseRunning = true;
        const maybePromise = cb({ count });
        if (!maybePromise) {
            done();
            return;
        }
        maybePromise.then(done).catch(done);
    };
    return {
        schedule() {
            if (scheduleCount === 0 && !busy()) {
                scheduleFn(scheduleCb);
            }
            scheduleCount++;
        },
        await() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!busy()) {
                    return;
                }
                if (!awaitingPromise) {
                    awaitingPromise = new Promise((resolve) => {
                        awaitingDone = resolve;
                    });
                }
                while (busy()) {
                    yield awaitingPromise;
                }
            });
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvcmVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsRUFBWTtJQUNoRCxPQUFPLGNBQWMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUFZO0lBQzFDLE9BQU8sY0FBYyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxVQUFvQyxFQUFFLEVBQVk7SUFDdEUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztJQUMzQixJQUFJLGVBQTBDLENBQUM7SUFDL0MsSUFBSSxZQUFzQyxDQUFDO0lBRTNDLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRTtRQUNkLE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUMsQ0FBQztJQUVGLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRTtRQUNkLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFFdkIsWUFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxFQUFJLENBQUM7UUFDakIsWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUN6QixlQUFlLEdBQUcsU0FBUyxDQUFDO1FBRTVCLElBQUksYUFBYSxHQUFHLENBQUMsRUFBRTtZQUNuQixVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDMUI7SUFDTCxDQUFDLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBRyxHQUFHLEVBQUU7UUFDcEIsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDO1FBRTVCLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDbEIsY0FBYyxHQUFHLElBQUksQ0FBQztRQUN0QixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRW5DLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixJQUFJLEVBQUUsQ0FBQztZQUNQLE9BQU87U0FDVjtRQUVELFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUMsQ0FBQztJQUVGLE9BQU87UUFDSCxRQUFRO1lBQ0osSUFBSSxhQUFhLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ2hDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMxQjtZQUNELGFBQWEsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFDSyxLQUFLOztnQkFDUCxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ1QsT0FBTztpQkFDVjtnQkFFRCxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUNsQixlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDdEMsWUFBWSxHQUFHLE9BQU8sQ0FBQztvQkFDM0IsQ0FBQyxDQUFDLENBQUM7aUJBQ047Z0JBRUQsT0FBTyxJQUFJLEVBQUUsRUFBRTtvQkFDWCxNQUFNLGVBQWUsQ0FBQztpQkFDekI7WUFDTCxDQUFDO1NBQUE7S0FDSixDQUFDO0FBQ04sQ0FBQyJ9