import { Listeners } from '../../util/listeners';
var BaseManager = /** @class */ (function () {
    function BaseManager() {
        this.listeners = new Listeners();
    }
    BaseManager.prototype.addListener = function (type, cb) {
        return this.listeners.addListener(type, cb);
    };
    BaseManager.prototype.removeListener = function (listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
    };
    return BaseManager;
}());
export { BaseManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vYmFzZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWpEO0lBQUE7UUFDdUIsY0FBUyxHQUFHLElBQUksU0FBUyxFQUEwQyxDQUFDO0lBWTNGLENBQUM7SUFWVSxpQ0FBVyxHQUFsQixVQUNJLElBQU8sRUFDUCxFQUFzQjtRQUV0QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFTLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sb0NBQWMsR0FBckIsVUFBc0IsY0FBc0I7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FBQyxBQWJELElBYUMifQ==