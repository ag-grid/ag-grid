module awk.grid {

    var _ = Utils;

    export class RenderedHeaderElement {

        private eRoot: HTMLElement;
        private dragStartX: number;

        constructor(eRoot: HTMLElement) {
            this.eRoot = eRoot;
        }

        public getERoot(): HTMLElement {
            return this.eRoot;
        }

        // methods implemented by the base classes
        public destroy(): void {}
        public refreshFilterIcon(): void {}
        public refreshSortIcon(): void {}
        public onDragStart(): void {}
        public onDragging(dragChange: number): void {}
        public onIndividualColumnResized(column: Column): void {}

        public addDragHandler(eDraggableElement: any) {
            var that = this;
            eDraggableElement.addEventListener('mousedown', function (downEvent: any) {
                that.onDragStart();
                that.eRoot.style.cursor = "col-resize";
                that.dragStartX = downEvent.clientX;

                var listenersToRemove = <any> {};

                listenersToRemove.mousemove = function (moveEvent: any) {
                    var newX = moveEvent.clientX;
                    var change = newX - that.dragStartX;
                    that.onDragging(change);
                };

                listenersToRemove.mouseup = function () {
                    that.stopDragging(listenersToRemove);
                };

                listenersToRemove.mouseleave = function () {
                    that.stopDragging(listenersToRemove);
                };

                that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
                that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
                that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
            });
        }

        public stopDragging(listenersToRemove: any) {
            this.eRoot.style.cursor = "";
            var that = this;
            _.iterateObject(listenersToRemove, function (key: any, listener: any) {
                that.eRoot.removeEventListener(key, listener);
            });
        }

    }

}