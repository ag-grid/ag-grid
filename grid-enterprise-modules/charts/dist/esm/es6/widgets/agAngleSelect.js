var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgAbstractField, Autowired, AgAbstractLabel, RefSelector, _ } from "@ag-grid-community/core";
export class AgAngleSelect extends AgAbstractLabel {
    constructor(config) {
        super(config, AgAngleSelect.TEMPLATE);
        this.radius = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    postConstruct() {
        super.postConstruct();
        this.dragListener = {
            eElement: this.eParentCircle,
            dragStartPixels: 0,
            onDragStart: (e) => {
                this.parentCircleRect = this.eParentCircle.getBoundingClientRect();
            },
            onDragging: (e) => this.calculateAngleDrag(e),
            onDragStop: () => { }
        };
        this.dragService.addDragSource(this.dragListener);
        this.eAngleValue
            .setLabel('')
            .setLabelWidth(5)
            .setInputWidth(45)
            .setMin(0)
            .setMax(360)
            .setValue(`${this.degrees}`)
            .onValueChange((value) => {
            if (value == null || value === '') {
                value = '0';
            }
            value = this.eAngleValue.normalizeValue(value);
            let floatValue = parseFloat(value);
            if (floatValue > 180) {
                floatValue = floatValue - 360;
            }
            this.setValue(floatValue);
        });
        this.updateNumberInput();
        if (_.exists(this.getValue())) {
            this.eAngleValue.setValue(this.normalizeNegativeValue(this.getValue()).toString());
        }
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, () => {
            const eDocument = this.gridOptionsService.getDocument();
            if (this.eAngleValue.getInputElement().contains(eDocument.activeElement)) {
                return;
            }
            this.updateNumberInput();
        });
    }
    updateNumberInput() {
        const normalizedValue = this.normalizeNegativeValue(this.getValue());
        this.eAngleValue.setValue(normalizedValue.toString());
    }
    positionChildCircle(radians) {
        const rect = this.parentCircleRect || { width: 24, height: 24 };
        const eChildCircle = this.eChildCircle;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        eChildCircle.style.left = `${centerX + Math.cos(radians) * 8}px`;
        eChildCircle.style.top = `${centerY + Math.sin(radians) * 8}px`;
    }
    calculatePolar() {
        const x = this.offsetX;
        const y = this.offsetY;
        const radians = Math.atan2(y, x);
        this.degrees = this.toDegrees(radians);
        this.radius = Math.sqrt((x * x) + (y * y));
        this.positionChildCircle(radians);
    }
    calculateCartesian() {
        const radians = this.toRadians(this.getValue());
        const radius = this.getRadius();
        this
            .setOffsetX(Math.cos(radians) * radius)
            .setOffsetY(Math.sin(radians) * radius);
    }
    setOffsetX(offset) {
        if (this.offsetX !== offset) {
            this.offsetX = offset;
            this.calculatePolar();
        }
        return this;
    }
    setOffsetY(offset) {
        if (this.offsetY !== offset) {
            this.offsetY = offset;
            this.calculatePolar();
        }
        return this;
    }
    calculateAngleDrag(e) {
        const rect = this.parentCircleRect;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - centerX;
        const dy = y - centerY;
        const radians = Math.atan2(dy, dx);
        this.setValue(radians, true);
    }
    toDegrees(radians) {
        return radians / Math.PI * 180;
    }
    toRadians(degrees) {
        return degrees / 180 * Math.PI;
    }
    normalizeNegativeValue(degrees) {
        return degrees < 0 ? 360 + degrees : degrees;
    }
    normalizeAngle180(radians) {
        radians %= Math.PI * 2;
        if (radians < -Math.PI) {
            radians += Math.PI * 2;
        }
        else if (radians >= Math.PI) {
            radians -= Math.PI * 2;
        }
        return radians;
    }
    getRadius() {
        return this.radius;
    }
    setRadius(r) {
        if (this.radius === r) {
            return this;
        }
        this.radius = r;
        this.calculateCartesian();
        return this;
    }
    onValueChange(callbackFn) {
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, () => {
            callbackFn(this.degrees);
        });
        return this;
    }
    getValue(radians) {
        return radians ? this.toRadians(this.degrees) : this.degrees;
    }
    setValue(degrees, radians) {
        let radiansValue;
        if (!radians) {
            radiansValue = this.normalizeAngle180(this.toRadians(degrees));
        }
        else {
            radiansValue = degrees;
        }
        degrees = this.toDegrees(radiansValue);
        if (this.degrees !== degrees) {
            this.degrees = Math.floor(degrees);
            this.calculateCartesian();
            this.positionChildCircle(radiansValue);
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }
        return this;
    }
    setWidth(width) {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }
    setDisabled(disabled) {
        super.setDisabled(disabled);
        this.eAngleValue.setDisabled(disabled);
        return this;
    }
    destroy() {
        this.dragService.removeDragSource(this.dragListener);
        super.destroy();
    }
}
AgAngleSelect.TEMPLATE = `<div class="ag-angle-select">
            <div ref="eLabel"></div>
            <div class="ag-wrapper ag-angle-select-wrapper">
                <div ref="eAngleSelectField" class="ag-angle-select-field">
                    <div ref="eParentCircle" class="ag-angle-select-parent-circle">
                        <div ref="eChildCircle" class="ag-angle-select-child-circle"></div>
                    </div>
                </div>
                <ag-input-number-field ref="eAngleValue"></ag-input-number-field>
            </div>
        </div>`;
__decorate([
    RefSelector('eLabel')
], AgAngleSelect.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eParentCircle')
], AgAngleSelect.prototype, "eParentCircle", void 0);
__decorate([
    RefSelector('eChildCircle')
], AgAngleSelect.prototype, "eChildCircle", void 0);
__decorate([
    RefSelector('eAngleValue')
], AgAngleSelect.prototype, "eAngleValue", void 0);
__decorate([
    Autowired('dragService')
], AgAngleSelect.prototype, "dragService", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdBbmdsZVNlbGVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy93aWRnZXRzL2FnQW5nbGVTZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLGVBQWUsRUFBc0IsU0FBUyxFQUFlLGVBQWUsRUFBZ0MsV0FBVyxFQUFFLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR3JLLE1BQU0sT0FBTyxhQUFjLFNBQVEsZUFBZTtJQTZCOUMsWUFBWSxNQUFpQjtRQUN6QixLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQU5sQyxXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsWUFBTyxHQUFXLENBQUMsQ0FBQztJQUs1QixDQUFDO0lBRUQsYUFBYTtRQUNULEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUV0QixJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUM1QixlQUFlLEVBQUUsQ0FBQztZQUNsQixXQUFXLEVBQUUsQ0FBQyxDQUFxQixFQUFFLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDdkUsQ0FBQztZQUNELFVBQVUsRUFBRSxDQUFDLENBQXFCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDakUsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7U0FDeEIsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsV0FBVzthQUNYLFFBQVEsQ0FBQyxFQUFFLENBQUM7YUFDWixhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ2hCLGFBQWEsQ0FBQyxFQUFFLENBQUM7YUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNULE1BQU0sQ0FBQyxHQUFHLENBQUM7YUFDWCxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDM0IsYUFBYSxDQUFDLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDN0IsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUU7Z0JBQy9CLEtBQUssR0FBRyxHQUFHLENBQUM7YUFDZjtZQUNELEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxJQUFJLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsSUFBSSxVQUFVLEdBQUcsR0FBRyxFQUFFO2dCQUNsQixVQUFVLEdBQUcsVUFBVSxHQUFHLEdBQUcsQ0FBQzthQUNqQztZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDdEY7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1lBQzlELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4RCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDdEUsT0FBTzthQUNWO1lBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8saUJBQWlCO1FBQ3JCLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsT0FBZTtRQUN2QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNoRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBRXZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRWhDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDakUsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztJQUNwRSxDQUFDO0lBRU8sY0FBYztRQUNsQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFdkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU8sa0JBQWtCO1FBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDaEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRWhDLElBQUk7YUFDQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUM7YUFDdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVPLFVBQVUsQ0FBQyxNQUFjO1FBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxNQUFNLEVBQUU7WUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3pCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLFVBQVUsQ0FBQyxNQUFjO1FBQzdCLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxNQUFNLEVBQUU7WUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLENBQXFCO1FBQzVDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNuQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVoQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBRS9CLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDdkIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUV2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU8sU0FBUyxDQUFDLE9BQWU7UUFDN0IsT0FBTyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDbkMsQ0FBQztJQUVPLFNBQVMsQ0FBQyxPQUFlO1FBQzdCLE9BQU8sT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTyxzQkFBc0IsQ0FBQyxPQUFlO1FBQzFDLE9BQU8sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ2pELENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxPQUFlO1FBQ3JDLE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV2QixJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDcEIsT0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO2FBQU0sSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUMzQixPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDMUI7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sU0FBUyxDQUFDLENBQVM7UUFDdEIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLGFBQWEsQ0FBQyxVQUFzQztRQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1lBQzlELFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sUUFBUSxDQUFDLE9BQWlCO1FBQzdCLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNqRSxDQUFDO0lBRU0sUUFBUSxDQUFDLE9BQWUsRUFBRSxPQUFpQjtRQUM5QyxJQUFJLFlBQW9CLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO2FBQU07WUFDSCxZQUFZLEdBQUcsT0FBTyxDQUFDO1NBQzFCO1FBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdkMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRTtZQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDL0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWE7UUFDekIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFdBQVcsQ0FBQyxRQUFpQjtRQUNoQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFUyxPQUFPO1FBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLENBQUM7O0FBeE9jLHNCQUFRLEdBQ25COzs7Ozs7Ozs7O2VBVU8sQ0FBQztBQUVXO0lBQXRCLFdBQVcsQ0FBQyxRQUFRLENBQUM7NkNBQXdDO0FBQ2hDO0lBQTdCLFdBQVcsQ0FBQyxlQUFlLENBQUM7b0RBQTZDO0FBQzdDO0lBQTVCLFdBQVcsQ0FBQyxjQUFjLENBQUM7bURBQTRDO0FBQzVDO0lBQTNCLFdBQVcsQ0FBQyxhQUFhLENBQUM7a0RBQWtEO0FBRW5EO0lBQXpCLFNBQVMsQ0FBQyxhQUFhLENBQUM7a0RBQTZDIn0=