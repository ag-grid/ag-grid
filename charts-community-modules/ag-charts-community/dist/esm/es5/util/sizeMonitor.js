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
var SizeMonitor = /** @class */ (function () {
    function SizeMonitor() {
    }
    SizeMonitor.init = function () {
        var _this = this;
        var NativeResizeObserver = window.ResizeObserver;
        if (NativeResizeObserver) {
            this.resizeObserver = new NativeResizeObserver(function (entries) {
                var e_1, _a;
                try {
                    for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        var _b = entry.contentRect, width = _b.width, height = _b.height;
                        _this.checkSize(_this.elements.get(entry.target), entry.target, width, height);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        }
        else {
            // polyfill (more reliable even in browsers that support ResizeObserver)
            var step = function () {
                _this.elements.forEach(function (entry, element) {
                    _this.checkClientSize(element, entry);
                });
            };
            window.setInterval(step, 100);
        }
        this.ready = true;
    };
    SizeMonitor.checkSize = function (entry, element, width, height) {
        if (entry) {
            if (!entry.size || width !== entry.size.width || height !== entry.size.height) {
                entry.size = { width: width, height: height };
                entry.cb(entry.size, element);
            }
        }
    };
    // Only a single callback is supported.
    SizeMonitor.observe = function (element, cb) {
        if (!this.ready) {
            this.init();
        }
        this.unobserve(element);
        if (this.resizeObserver) {
            this.resizeObserver.observe(element);
        }
        this.elements.set(element, { cb: cb });
        // Ensure first size callback happens synchronously.
        this.checkClientSize(element, { cb: cb });
    };
    SizeMonitor.unobserve = function (element) {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(element);
        }
        this.elements.delete(element);
    };
    SizeMonitor.checkClientSize = function (element, entry) {
        var width = element.clientWidth ? element.clientWidth : 0;
        var height = element.clientHeight ? element.clientHeight : 0;
        this.checkSize(entry, element, width, height);
    };
    SizeMonitor.elements = new Map();
    SizeMonitor.ready = false;
    return SizeMonitor;
}());
export { SizeMonitor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l6ZU1vbml0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9zaXplTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVVBO0lBQUE7SUFnRUEsQ0FBQztJQTNEVSxnQkFBSSxHQUFYO1FBQUEsaUJBcUJDO1FBcEJHLElBQU0sb0JBQW9CLEdBQUksTUFBYyxDQUFDLGNBQWMsQ0FBQztRQUU1RCxJQUFJLG9CQUFvQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxVQUFDLE9BQVk7OztvQkFDeEQsS0FBb0IsSUFBQSxZQUFBLFNBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFO3dCQUF4QixJQUFNLEtBQUssb0JBQUE7d0JBQ04sSUFBQSxLQUFvQixLQUFLLENBQUMsV0FBVyxFQUFuQyxLQUFLLFdBQUEsRUFBRSxNQUFNLFlBQXNCLENBQUM7d0JBQzVDLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUNoRjs7Ozs7Ozs7O1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsd0VBQXdFO1lBQ3hFLElBQU0sSUFBSSxHQUFHO2dCQUNULEtBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLE9BQU87b0JBQ2pDLEtBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVjLHFCQUFTLEdBQXhCLFVBQXlCLEtBQXdCLEVBQUUsT0FBb0IsRUFBRSxLQUFhLEVBQUUsTUFBYztRQUNsRyxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzNFLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLE9BQUEsRUFBRSxNQUFNLFFBQUEsRUFBRSxDQUFDO2dCQUMvQixLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDakM7U0FDSjtJQUNMLENBQUM7SUFFRCx1Q0FBdUM7SUFDaEMsbUJBQU8sR0FBZCxVQUFlLE9BQW9CLEVBQUUsRUFBZ0I7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDYixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZjtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFBLEVBQUUsQ0FBQyxDQUFDO1FBRW5DLG9EQUFvRDtRQUNwRCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBQSxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU0scUJBQVMsR0FBaEIsVUFBaUIsT0FBb0I7UUFDakMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLDJCQUFlLEdBQXRCLFVBQXVCLE9BQW9CLEVBQUUsS0FBWTtRQUNyRCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQTlEYyxvQkFBUSxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO0lBRXpDLGlCQUFLLEdBQUcsS0FBSyxDQUFDO0lBNkRqQyxrQkFBQztDQUFBLEFBaEVELElBZ0VDO1NBaEVZLFdBQVcifQ==