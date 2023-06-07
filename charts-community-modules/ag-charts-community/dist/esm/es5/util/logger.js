var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
/* eslint-disable no-console */
import { doOnce } from './function';
export var Logger = {
    debug: function () {
        var logContent = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            logContent[_i] = arguments[_i];
        }
        console.log.apply(console, __spreadArray([], __read(logContent)));
    },
    warn: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spreadArray(["AG Charts - " + message], __read(logContent)));
    },
    error: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        if (typeof message === 'object') {
            console.error.apply(console, __spreadArray(["AG Charts error", message], __read(logContent)));
        }
        else {
            console.error.apply(console, __spreadArray(["AG Charts - " + message], __read(logContent)));
        }
    },
    warnOnce: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        doOnce(function () { return Logger.warn.apply(Logger, __spreadArray([message], __read(logContent))); }, "Logger.warn: " + message);
    },
    errorOnce: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        doOnce(function () { return Logger.error.apply(Logger, __spreadArray([message], __read(logContent))); }, "Logger.warn: " + message);
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLE1BQU0sR0FBRztJQUNsQixLQUFLLEVBQUw7UUFBTSxvQkFBb0I7YUFBcEIsVUFBb0IsRUFBcEIscUJBQW9CLEVBQXBCLElBQW9CO1lBQXBCLCtCQUFvQjs7UUFDdEIsT0FBTyxDQUFDLEdBQUcsT0FBWCxPQUFPLDJCQUFRLFVBQVUsSUFBRTtJQUMvQixDQUFDO0lBRUQsSUFBSSxFQUFKLFVBQUssT0FBZTtRQUFFLG9CQUFvQjthQUFwQixVQUFvQixFQUFwQixxQkFBb0IsRUFBcEIsSUFBb0I7WUFBcEIsbUNBQW9COztRQUN0QyxPQUFPLENBQUMsSUFBSSxPQUFaLE9BQU8saUJBQU0saUJBQWUsT0FBUyxVQUFLLFVBQVUsSUFBRTtJQUMxRCxDQUFDO0lBRUQsS0FBSyxFQUFMLFVBQU0sT0FBZTtRQUFFLG9CQUFvQjthQUFwQixVQUFvQixFQUFwQixxQkFBb0IsRUFBcEIsSUFBb0I7WUFBcEIsbUNBQW9COztRQUN2QyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUM3QixPQUFPLENBQUMsS0FBSyxPQUFiLE9BQU8saUJBQU8saUJBQWlCLEVBQUUsT0FBTyxVQUFLLFVBQVUsSUFBRTtTQUM1RDthQUFNO1lBQ0gsT0FBTyxDQUFDLEtBQUssT0FBYixPQUFPLGlCQUFPLGlCQUFlLE9BQVMsVUFBSyxVQUFVLElBQUU7U0FDMUQ7SUFDTCxDQUFDO0lBRUQsUUFBUSxFQUFSLFVBQVMsT0FBZTtRQUFFLG9CQUFvQjthQUFwQixVQUFvQixFQUFwQixxQkFBb0IsRUFBcEIsSUFBb0I7WUFBcEIsbUNBQW9COztRQUMxQyxNQUFNLENBQUMsY0FBTSxPQUFBLE1BQU0sQ0FBQyxJQUFJLE9BQVgsTUFBTSxpQkFBTSxPQUFPLFVBQUssVUFBVSxLQUFsQyxDQUFtQyxFQUFFLGtCQUFnQixPQUFTLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsU0FBUyxFQUFULFVBQVUsT0FBZTtRQUFFLG9CQUFvQjthQUFwQixVQUFvQixFQUFwQixxQkFBb0IsRUFBcEIsSUFBb0I7WUFBcEIsbUNBQW9COztRQUMzQyxNQUFNLENBQUMsY0FBTSxPQUFBLE1BQU0sQ0FBQyxLQUFLLE9BQVosTUFBTSxpQkFBTyxPQUFPLFVBQUssVUFBVSxLQUFuQyxDQUFvQyxFQUFFLGtCQUFnQixPQUFTLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBQ0osQ0FBQyJ9