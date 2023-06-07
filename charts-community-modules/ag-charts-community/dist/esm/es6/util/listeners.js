import { Logger } from './logger';
export class Listeners {
    constructor() {
        this.registeredListeners = {};
    }
    addListener(type, cb) {
        var _a;
        const symbol = Symbol(type);
        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }
        (_a = this.registeredListeners[type]) === null || _a === void 0 ? void 0 : _a.push({ symbol, handler: cb });
        return symbol;
    }
    dispatch(type, ...params) {
        var _a;
        const listeners = (_a = this.registeredListeners[type]) !== null && _a !== void 0 ? _a : [];
        const results = [];
        for (const listener of listeners) {
            try {
                results.push(listener.handler(...params));
            }
            catch (e) {
                Logger.errorOnce(e);
                results.push(undefined);
            }
        }
        return results;
    }
    cancellableDispatch(type, cancelled, ...params) {
        var _a;
        const listeners = (_a = this.registeredListeners[type]) !== null && _a !== void 0 ? _a : [];
        const results = [];
        for (const listener of listeners) {
            if (cancelled())
                break;
            results.push(listener.handler(...params));
        }
        return results;
    }
    reduceDispatch(type, reduceFn, ...params) {
        var _a;
        const listeners = (_a = this.registeredListeners[type]) !== null && _a !== void 0 ? _a : [];
        let listenerResult = undefined;
        for (const listener of listeners) {
            listenerResult = listener.handler(...params);
            params = reduceFn(listenerResult, ...params);
        }
        return listenerResult;
    }
    removeListener(listenerSymbol) {
        for (const type in this.registeredListeners) {
            const listeners = this.registeredListeners[type];
            const match = listeners === null || listeners === void 0 ? void 0 : listeners.findIndex((entry) => entry.symbol === listenerSymbol);
            if (match != null && match >= 0) {
                listeners === null || listeners === void 0 ? void 0 : listeners.splice(match, 1);
            }
            if (match != null && (listeners === null || listeners === void 0 ? void 0 : listeners.length) === 0) {
                delete this.registeredListeners[type];
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGVuZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvbGlzdGVuZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFPbEMsTUFBTSxPQUFPLFNBQVM7SUFBdEI7UUFDdUIsd0JBQW1CLEdBQTJDLEVBQUUsQ0FBQztJQXlFeEYsQ0FBQztJQXZFVSxXQUFXLENBQXFDLElBQU8sRUFBRSxFQUFLOztRQUNqRSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3ZDO1FBRUQsTUFBQSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLDBDQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBUyxFQUFFLENBQUMsQ0FBQztRQUVyRSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU0sUUFBUSxDQUFDLElBQVcsRUFBRSxHQUFHLE1BQTJCOztRQUN2RCxNQUFNLFNBQVMsR0FBd0IsTUFBQSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLG1DQUFJLEVBQUUsQ0FBQztRQUM1RSxNQUFNLE9BQU8sR0FBMEIsRUFBRSxDQUFDO1FBQzFDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1lBQzlCLElBQUk7Z0JBQ0EsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUM3QztZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBZ0IsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sbUJBQW1CLENBQ3RCLElBQVcsRUFDWCxTQUF3QixFQUN4QixHQUFHLE1BQTJCOztRQUU5QixNQUFNLFNBQVMsR0FBRyxNQUFBLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsbUNBQUksRUFBRSxDQUFDO1FBRXZELE1BQU0sT0FBTyxHQUEwQixFQUFFLENBQUM7UUFDMUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7WUFDOUIsSUFBSSxTQUFTLEVBQUU7Z0JBQUUsTUFBTTtZQUV2QixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzdDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLGNBQWMsQ0FDakIsSUFBVyxFQUNYLFFBQThGLEVBQzlGLEdBQUcsTUFBMkI7O1FBRTlCLE1BQU0sU0FBUyxHQUFHLE1BQUEsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxtQ0FBSSxFQUFFLENBQUM7UUFDdkQsSUFBSSxjQUFjLEdBQUcsU0FBUyxDQUFDO1FBQy9CLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1lBQzlCLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDN0MsTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztTQUNoRDtRQUVELE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7SUFFTSxjQUFjLENBQUMsY0FBc0I7UUFDeEMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pELE1BQU0sS0FBSyxHQUFHLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxTQUFTLENBQUMsQ0FBQyxLQUFvQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBRTlGLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO2dCQUM3QixTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUNELElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFBLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxNQUFNLE1BQUssQ0FBQyxFQUFFO2dCQUMxQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFhLENBQUMsQ0FBQzthQUNsRDtTQUNKO0lBQ0wsQ0FBQztDQUNKIn0=