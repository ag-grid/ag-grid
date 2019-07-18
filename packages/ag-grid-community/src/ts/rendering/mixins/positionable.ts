import { PopupService } from "../../widgets/popupService";
import { Autowired } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { _ } from "../../utils";

export function Positionable<T extends { new(...args:any[]): any }>(target: T) {
    abstract class MixinClass extends target {

        @Autowired('popupService') popupService: PopupService;
        @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

        abstract renderComponent?(): void;
        config: any;
        popupParent: HTMLElement;
        minWidth: number;
        minHeight?: number;
        positioned = false;

        dragStartPosition = {
            x: 0,
            y: 0
        };

        position = {
            x: 0,
            y: 0
        };

        size: { width: number | undefined, height: number | undefined } = {
            width:undefined,
            height: undefined
        };

        postConstruct() {
            if (this.positioned) {
                return;
            }

            const { minWidth, width, minHeight, height, centered, x, y } = this.config;

            this.minHeight = minHeight != null ? minHeight : 250;
            this.minWidth = minWidth != null ? minWidth : 250;

            this.popupParent = this.popupService.getPopupParent();

            if (width) {
                this.setWidth(width);
            }

            if (height) {
                this.setHeight(height);
            }

            if (this.renderComponent) {
                this.renderComponent();
            }

            if (!width || !height) {
                this.refreshSize();
            }

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

        public setHeight(height: number | string) {
            const eGui = this.getGui();
            let isPercent = false;
            if (typeof height === 'string' && height.indexOf('%') !== -1) {
                _.setFixedHeight(eGui, height);
                height = _.getAbsoluteHeight(eGui);
                isPercent = true;
            } else {
                height = Math.max(this.minHeight, height as number);
                const offsetParent = eGui.offsetParent;
                if (offsetParent && offsetParent.clientHeight && (height + this.position.y > offsetParent.clientHeight)) {
                    height = offsetParent.clientHeight - this.position.y;
                }
            }

            if (this.size.height === height) { return; }

            this.size.height = height;

            if (!isPercent) {
                _.setFixedHeight(eGui, height);
            }
        }

        public getWidth(): number {
            return this.size.width;
        }

        public setWidth(width: number | string) {
            const eGui = this.getGui();
            let isPercent = false;
            if (typeof width === 'string' && width.indexOf('%') !== -1) {
                _.setFixedWidth(eGui, width);
                width = _.getAbsoluteWidth(eGui);
                isPercent = true;
            } else {
                width = Math.max(this.minWidth, width as number);
                const offsetParent = eGui.offsetParent;

                if (offsetParent && offsetParent.clientWidth && (width + this.position.x > offsetParent.clientWidth)) {
                    width = offsetParent.clientWidth - this.position.x;
                }
            }

            if (this.size.width === width) { return; }

            this.size.width = width;
            if (!isPercent) {
                _.setFixedWidth(eGui, width);
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