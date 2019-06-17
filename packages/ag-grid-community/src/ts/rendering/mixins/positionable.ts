import { PopupService } from "../../widgets/popupService";
import { IComponent } from "../../interfaces/iComponent";
import { Autowired } from "../../context/context";
import { _ } from "../../utils";

export interface IPositionable extends IComponent<any> {
    getHeight?(): number;
    setHeight?(height: number): void;
    getWidth?(): number;
    setWidth?(width: number): void;
    center?(): void;
    postConstruct(): void;
}

export function Positionable<T extends { new(...args:any[]): IPositionable }>(target: T) {
    abstract class MixinClass extends target {

        abstract config: any;
        abstract popupParent: HTMLElement;
        abstract minWidth?: number;
        abstract minHeight?: number;
        abstract renderComponent?(): void;

        @Autowired('popupService') popupService: PopupService;

        positioned = false;

        dragStartPosition = {
            x: 0,
            y: 0
        };

        position = {
            x: 0,
            y: 0
        };

        size = {
            width: 0,
            height: 0
        };

        postConstruct() {
            if (this.positioned) {
                return;
            }
            super.postConstruct();
            const eGui = this.getGui();
            const { minWidth, width, minHeight, height, centered, x, y } = this.config;

            this.minHeight = minHeight != null ? minHeight : 250;
            this.minWidth = minWidth != null ? minWidth : 250;

            this.popupParent = this.popupService.getPopupParent();

            if (width) {
                _.setFixedWidth(eGui, width);
                this.size.width = width;
            }

            if (height) {
                _.setFixedHeight(eGui, height);
                this.size.height = height;
            }

            if (this.renderComponent) {
                this.renderComponent();
            }

            this.refreshSize();

            if (centered) {
                this.center();
            } else if (x || y) {
                this.offsetElement(x, y);
            }

            this.positioned = true;
        }

        updateDragStartPosition(x: number, y: number) {
            this.dragStartPosition = { x, y };
        }

        calculateMouseMovement(params: {
            e: MouseEvent,
            topBuffer?: number,
            anywhereWithin?: boolean,
            isLeft?: boolean,
            isTop?: boolean
        }): { movementX: number, movementY: number} {
            const parentRect = this.popupParent.getBoundingClientRect();
            const { e, isLeft, isTop, anywhereWithin, topBuffer } = params;
            let movementX = e.clientX - this.dragStartPosition.x;
            let movementY = e.clientY - this.dragStartPosition.y;
            const width = this.getWidth();
            const height = this.getHeight();

            // skip if cursor is outside of popupParent horizontally
            let skipX = (
                parentRect.left >= e.clientX && this.position.x <= 0 ||
                parentRect.right <= e.clientX && parentRect.right <= this.position.x + parentRect.left + width
            );

            if (!skipX) {
                if (isLeft) {
                    skipX = (
                        // skip if we are moving to the left and the cursor
                        // is positioned to the right of the left side anchor
                        (movementX < 0 && e.clientX > this.position.x + parentRect.left) ||
                        // skip if we are moving to the right and the cursor
                        // is positioned to the left of the dialog
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left)
                    );
                } else {
                    if (anywhereWithin) {
                        // if anywhereWithin is true, we allow to move
                        // as long as the cursor is within the dialog
                        skipX = (
                            (movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                            (movementX > 0 && e.clientX < this.position.x + parentRect.left)
                        );
                    } else {
                        skipX = (
                            // if the movement is bound to the right side of the dialog
                            // we skip if we are moving to the left and the cursor
                            // is to the right of the dialog
                            (movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                            // or skip if we are moving to the right and the cursor
                            // is to the left of the right side anchor
                            (movementX > 0 && e.clientX < this.position.x + parentRect.left + width)
                        );
                    }
                }
            }

            movementX = skipX ? 0 : movementX;

            const skipY = (
                // skip if cursor is outside of popupParent vertically
                parentRect.top >= e.clientY && this.position.y <= 0 ||
                parentRect.bottom <= e.clientY && parentRect.bottom <= this.position.y + parentRect.top + height ||
                isTop && (
                    // skip if we are moving to towards top and the cursor is
                    // below the top anchor + topBuffer
                    // note: topBuffer is used when moving the dialog using the title bar
                    (movementY < 0 && e.clientY > this.position.y + parentRect.top + (topBuffer || 0)) ||
                    // skip if we are moving to the bottom and the cursor is
                    // above the top anchor
                    (movementY > 0 && e.clientY < this.position.y + parentRect.top)
                ) ||
                // we are anchored to the bottom of the dialog
                !isTop && (
                    // skip if we are moving towards the top and the cursor
                    // is below the bottom anchor
                    (movementY < 0 && e.clientY > this.position.y + parentRect.top + height) ||

                    // skip if we are moving towards the bottom and the cursor
                    // is above the bottom anchor
                    (movementY > 0 && e.clientY < this.position.y + parentRect.top + height)
                )
            );

            movementY = skipY ? 0 : movementY;

            return { movementX, movementY };
        }

        refreshSize() {
            const { width, height } = this.size;

            if (!width) {
                this.setWidth(this.getGui().offsetWidth);
            }

            if (!height) {
                this.setHeight(this.getGui().offsetHeight);
            }
        }

        offsetElement(x = 0, y = 0) {
            const ePopup = this.getGui();

            this.popupService.positionPopup({
                ePopup,
                x,
                y,
                minWidth: this.minWidth,
                minHeight: this.minHeight,
                keepWithinBounds: true
            });

            this.position.x = parseInt(ePopup.style.left, 10);
            this.position.y = parseInt(ePopup.style.top, 10);
        }

        public getHeight(): number {
            return this.size.height;
        }

        public setHeight(height: number) {
            let newHeight = Math.max(this.minHeight, height);
            const eGui = this.getGui();

            if (newHeight + this.position.y > eGui.offsetParent.clientHeight) {
                newHeight = eGui.offsetParent.clientHeight - this.position.y;
            }

            if (this.size.height === newHeight) { return; }

            this.size.height = newHeight;
            _.setFixedHeight(eGui, newHeight);

            if (super.setHeight) {
                super.setHeight(height);
            }
        }

        public getWidth(): number {
            return this.size.width;
        }

        public setWidth(width: number) {
            let newWidth = Math.max(this.minWidth, width);
            const eGui = this.getGui();

            if (newWidth + this.position.x > eGui.offsetParent.clientWidth) {
                newWidth = eGui.offsetParent.clientWidth - this.position.x;
            }

            if (this.size.width === newWidth) { return; }

            this.size.width = newWidth;
            _.setFixedWidth(eGui, newWidth);

            if (super.setWidth) {
                super.setWidth(width);
            }
        }

        public center() {
            const eGui = this.getGui();

            const x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
            const y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);

            this.offsetElement(x, y);
        }
    }

    return MixinClass;
}