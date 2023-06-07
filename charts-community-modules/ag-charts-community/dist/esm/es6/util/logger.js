/* eslint-disable no-console */
import { doOnce } from './function';
export const Logger = {
    debug(...logContent) {
        console.log(...logContent);
    },
    warn(message, ...logContent) {
        console.warn(`AG Charts - ${message}`, ...logContent);
    },
    error(message, ...logContent) {
        if (typeof message === 'object') {
            console.error(`AG Charts error`, message, ...logContent);
        }
        else {
            console.error(`AG Charts - ${message}`, ...logContent);
        }
    },
    warnOnce(message, ...logContent) {
        doOnce(() => Logger.warn(message, ...logContent), `Logger.warn: ${message}`);
    },
    errorOnce(message, ...logContent) {
        doOnce(() => Logger.error(message, ...logContent), `Logger.warn: ${message}`);
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRztJQUNsQixLQUFLLENBQUMsR0FBRyxVQUFpQjtRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFlLEVBQUUsR0FBRyxVQUFpQjtRQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsT0FBTyxFQUFFLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQWUsRUFBRSxHQUFHLFVBQWlCO1FBQ3ZDLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7U0FDNUQ7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxPQUFPLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1NBQzFEO0lBQ0wsQ0FBQztJQUVELFFBQVEsQ0FBQyxPQUFlLEVBQUUsR0FBRyxVQUFpQjtRQUMxQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsRUFBRSxnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsU0FBUyxDQUFDLE9BQWUsRUFBRSxHQUFHLFVBQWlCO1FBQzNDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLFVBQVUsQ0FBQyxFQUFFLGdCQUFnQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSixDQUFDIn0=