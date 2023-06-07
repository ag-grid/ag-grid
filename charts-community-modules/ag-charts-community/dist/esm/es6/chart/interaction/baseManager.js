import { Listeners } from '../../util/listeners';
export class BaseManager {
    constructor() {
        this.listeners = new Listeners();
    }
    addListener(type, cb) {
        return this.listeners.addListener(type, cb);
    }
    removeListener(listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vYmFzZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWpELE1BQU0sT0FBZ0IsV0FBVztJQUFqQztRQUN1QixjQUFTLEdBQUcsSUFBSSxTQUFTLEVBQTBDLENBQUM7SUFZM0YsQ0FBQztJQVZVLFdBQVcsQ0FDZCxJQUFPLEVBQ1AsRUFBc0I7UUFFdEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBUyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVNLGNBQWMsQ0FBQyxjQUFzQjtRQUN4QyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNsRCxDQUFDO0NBQ0oifQ==