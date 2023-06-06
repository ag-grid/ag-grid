var Observable = /** @class */ (function () {
    function Observable() {
        this.allEventListeners = new Map();
    }
    Observable.prototype.addEventListener = function (type, listener) {
        if (typeof listener !== 'function') {
            throw new Error('AG Charts - listener must be a Function');
        }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Set();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            eventListeners.add(listener);
        }
    };
    Observable.prototype.removeEventListener = function (type, listener) {
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            return;
        }
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
            allEventListeners.delete(type);
        }
    };
    Observable.prototype.hasEventListener = function (type) {
        return this.allEventListeners.has(type);
    };
    Observable.prototype.clearEventListeners = function () {
        this.allEventListeners.clear();
    };
    Observable.prototype.fireEvent = function (event) {
        var listeners = this.allEventListeners.get(event.type);
        listeners === null || listeners === void 0 ? void 0 : listeners.forEach(function (listener) { return listener(event); });
    };
    return Observable;
}());
export { Observable };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL29ic2VydmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUE7SUFBQTtRQUNZLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO0lBNEMzRSxDQUFDO0lBMUNHLHFDQUFnQixHQUFoQixVQUFpQixJQUFZLEVBQUUsUUFBNEI7UUFDdkQsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7WUFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1NBQzlEO1FBRU8sSUFBQSxpQkFBaUIsR0FBSyxJQUFJLGtCQUFULENBQVU7UUFDbkMsSUFBSSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDakIsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1lBQy9DLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDL0M7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMvQixjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUVELHdDQUFtQixHQUFuQixVQUFvQixJQUFZLEVBQUUsUUFBNEI7UUFDbEQsSUFBQSxpQkFBaUIsR0FBSyxJQUFJLGtCQUFULENBQVU7UUFDbkMsSUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBQ0QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQzNCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQztJQUNMLENBQUM7SUFFRCxxQ0FBZ0IsR0FBaEIsVUFBaUIsSUFBWTtRQUN6QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELHdDQUFtQixHQUFuQjtRQUNJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRVMsOEJBQVMsR0FBbkIsVUFBMEMsS0FBUTtRQUM5QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsT0FBTyxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDTCxpQkFBQztBQUFELENBQUMsQUE3Q0QsSUE2Q0MifQ==