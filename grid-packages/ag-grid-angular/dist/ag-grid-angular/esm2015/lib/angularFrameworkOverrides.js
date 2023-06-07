import { Injectable, NgZone } from "@angular/core";
import { VanillaFrameworkOverrides } from "ag-grid-community";
import { AgPromise } from "ag-grid-community";
import * as i0 from "@angular/core";
export class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(_ngZone) {
        super();
        this._ngZone = _ngZone;
    }
    setEmitterUsedCallback(isEmitterUsed) {
        this.isEmitterUsed = isEmitterUsed;
    }
    setTimeout(action, timeout) {
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(() => {
                window.setTimeout(() => {
                    action();
                }, timeout);
            });
        }
        else {
            window.setTimeout(() => {
                action();
            }, timeout);
        }
    }
    setInterval(action, interval) {
        return new AgPromise(resolve => {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(() => {
                    resolve(window.setInterval(() => {
                        action();
                    }, interval));
                });
            }
            else {
                resolve(window.setInterval(() => {
                    action();
                }, interval));
            }
        });
    }
    addEventListener(element, eventType, listener, useCapture) {
        if (this.isOutsideAngular(eventType) && this._ngZone) {
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener(eventType, listener, useCapture);
            });
        }
        else {
            element.addEventListener(eventType, listener, useCapture);
        }
    }
    dispatchEvent(eventType, listener, global = false) {
        if (this.isOutsideAngular(eventType)) {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(listener);
            }
            else {
                listener();
            }
        }
        else if (this.isEmitterUsed(eventType) || global) {
            // only trigger off events (and potentially change detection) if actually used
            if (!NgZone.isInAngularZone() && this._ngZone) {
                this._ngZone.run(listener);
            }
            else {
                listener();
            }
        }
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        const isAngularComp = prototype && 'agInit' in prototype;
        return isAngularComp;
    }
}
AngularFrameworkOverrides.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AngularFrameworkOverrides, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
AngularFrameworkOverrides.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AngularFrameworkOverrides });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AngularFrameworkOverrides, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUc1QyxNQUFNLE9BQU8seUJBQTBCLFNBQVEseUJBQXlCO0lBR3BFLFlBQW9CLE9BQWU7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFEUSxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBRW5DLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxhQUE2QztRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUV2QyxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQVcsRUFBRSxPQUFhO1FBQ3hDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDbkIsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNuQixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVNLFdBQVcsQ0FBQyxNQUFXLEVBQUUsUUFBYztRQUMxQyxPQUFPLElBQUksU0FBUyxDQUFTLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtvQkFDaEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO3dCQUN4QixNQUFNLEVBQUUsQ0FBQztvQkFDYixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQ2YsQ0FBQztnQkFDTixDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDeEIsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUNmLENBQUM7YUFDTDtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGdCQUFnQixDQUFDLE9BQW9CLEVBQUUsU0FBaUIsRUFBRSxRQUE2QyxFQUFFLFVBQW9CO1FBQ3pILElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzdEO0lBQ0wsQ0FBQztJQUVELGFBQWEsQ0FBQyxTQUFpQixFQUFFLFFBQWtCLEVBQUUsTUFBTSxHQUFHLEtBQUs7UUFDL0QsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0gsUUFBUSxFQUFFLENBQUM7YUFDZDtTQUNKO2FBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUNoRCw4RUFBOEU7WUFDOUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QjtpQkFBTTtnQkFDSCxRQUFRLEVBQUUsQ0FBQzthQUNkO1NBQ0o7SUFDTCxDQUFDO0lBRUQsb0JBQW9CLENBQUMsSUFBUztRQUMxQixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7U0FBRTtRQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sYUFBYSxHQUFHLFNBQVMsSUFBSSxRQUFRLElBQUksU0FBUyxDQUFDO1FBQ3pELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7O3VIQTVFUSx5QkFBeUI7MkhBQXpCLHlCQUF5Qjs0RkFBekIseUJBQXlCO2tCQURyQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge1ZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXN9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuaW1wb3J0IHtBZ1Byb21pc2V9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyBleHRlbmRzIFZhbmlsbGFGcmFtZXdvcmtPdmVycmlkZXMge1xuICAgIHByaXZhdGUgaXNFbWl0dGVyVXNlZDogKGV2ZW50VHlwZTogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBzZXRFbWl0dGVyVXNlZENhbGxiYWNrKGlzRW1pdHRlclVzZWQ6IChldmVudFR5cGU6IHN0cmluZykgPT4gYm9vbGVhbikge1xuICAgICAgICB0aGlzLmlzRW1pdHRlclVzZWQgPSBpc0VtaXR0ZXJVc2VkO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHNldFRpbWVvdXQoYWN0aW9uOiBhbnksIHRpbWVvdXQ/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX25nWm9uZSkge1xuICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRJbnRlcnZhbChhY3Rpb246IGFueSwgaW50ZXJ2YWw/OiBhbnkpOiBBZ1Byb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgQWdQcm9taXNlPG51bWJlcj4ocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUod2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXIgfCBFdmVudExpc3RlbmVyT2JqZWN0LCB1c2VDYXB0dXJlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc091dHNpZGVBbmd1bGFyKGV2ZW50VHlwZSkgJiYgdGhpcy5fbmdab25lKSB7XG4gICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudChldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6ICgpID0+IHt9LCBnbG9iYWwgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc091dHNpZGVBbmd1bGFyKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpIHx8IGdsb2JhbCkge1xuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyIG9mZiBldmVudHMgKGFuZCBwb3RlbnRpYWxseSBjaGFuZ2UgZGV0ZWN0aW9uKSBpZiBhY3R1YWxseSB1c2VkXG4gICAgICAgICAgICBpZiAoIU5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSAmJiB0aGlzLl9uZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzRnJhbWV3b3JrQ29tcG9uZW50KGNvbXA6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWNvbXApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGNvbnN0IHByb3RvdHlwZSA9IGNvbXAucHJvdG90eXBlO1xuICAgICAgICBjb25zdCBpc0FuZ3VsYXJDb21wID0gcHJvdG90eXBlICYmICdhZ0luaXQnIGluIHByb3RvdHlwZTtcbiAgICAgICAgcmV0dXJuIGlzQW5ndWxhckNvbXA7XG4gICAgfVxufVxuIl19