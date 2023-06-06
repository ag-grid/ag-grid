var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { AgColorPanel } from "./agColorPanel";
import { _, AgPickerField, AgDialog } from "@ag-grid-community/core";
var AgColorPicker = /** @class */ (function (_super) {
    __extends(AgColorPicker, _super);
    function AgColorPicker(config) {
        var _this = _super.call(this, config, 'ag-color-picker', 'colorPicker') || this;
        if (config && config.color) {
            _this.value = config.color;
        }
        return _this;
    }
    AgColorPicker.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        if (this.value) {
            this.setValue(this.value);
        }
    };
    AgColorPicker.prototype.showPicker = function () {
        var _this = this;
        var eGuiRect = this.getGui().getBoundingClientRect();
        var colorDialog = this.createBean(new AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        }));
        this.isPickerDisplayed = true;
        colorDialog.addCssClass('ag-color-dialog');
        _.setAriaExpanded(this.eWrapper, true);
        var colorPanel = this.createBean(new AgColorPanel({ picker: this }));
        colorPanel.addDestroyFunc(function () {
            if (colorDialog.isAlive()) {
                _this.destroyBean(colorDialog);
            }
        });
        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorDialog.addDestroyFunc(function () {
            // here we check if the picker was already being
            // destroyed to avoid a stack overflow
            if (!_this.isDestroyingPicker) {
                _this.isDestroyingPicker = true;
                if (colorPanel.isAlive()) {
                    _this.destroyBean(colorPanel);
                }
            }
            else {
                _this.isDestroyingPicker = false;
            }
            if (_this.isAlive()) {
                _.setAriaExpanded(_this.eWrapper, false);
                _this.getFocusableElement().focus();
            }
            _this.isPickerDisplayed = false;
        });
        return colorDialog;
    };
    AgColorPicker.prototype.setValue = function (color) {
        if (this.value === color) {
            return this;
        }
        this.eDisplayField.style.backgroundColor = color;
        return _super.prototype.setValue.call(this, color);
    };
    AgColorPicker.prototype.getValue = function () {
        return this.value;
    };
    return AgColorPicker;
}(AgPickerField));
export { AgColorPicker };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdDb2xvclBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy93aWRnZXRzL2FnQ29sb3JQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxDQUFDLEVBQVksYUFBYSxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBTS9FO0lBQW1DLGlDQUFrQztJQUNqRSx1QkFBWSxNQUEwQjtRQUF0QyxZQUNJLGtCQUFNLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLENBQUMsU0FLbEQ7UUFIRyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ3hCLEtBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztTQUM3Qjs7SUFDTCxDQUFDO0lBRVMscUNBQWEsR0FBdkI7UUFDSSxpQkFBTSxhQUFhLFdBQUUsQ0FBQztRQUV0QixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtJQUNMLENBQUM7SUFFTSxrQ0FBVSxHQUFqQjtRQUFBLGlCQW9EQztRQW5ERyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN2RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDO1lBQzdDLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixRQUFRLEVBQUUsR0FBRztZQUNiLEtBQUssRUFBRSxHQUFHO1lBQ1YsTUFBTSxFQUFFLEdBQUc7WUFDWCxDQUFDLEVBQUUsUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHO1lBQ3ZCLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUc7U0FDeEIsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBRTlCLFdBQVcsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdkMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdkUsVUFBVSxDQUFDLGNBQWMsQ0FBQztZQUN0QixJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDdkIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNqQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRXJDLFdBQVcsQ0FBQyxjQUFjLENBQUM7WUFDdkIsZ0RBQWdEO1lBQ2hELHNDQUFzQztZQUN0QyxJQUFJLENBQUMsS0FBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUMxQixLQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2dCQUUvQixJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDdEIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDaEM7YUFDSjtpQkFBTTtnQkFDSCxLQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO2FBQ25DO1lBRUQsSUFBSSxLQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2hCLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDeEMsS0FBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdEM7WUFFRCxLQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVNLGdDQUFRLEdBQWYsVUFBZ0IsS0FBYTtRQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUUxQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1FBRWpELE9BQU8saUJBQU0sUUFBUSxZQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxnQ0FBUSxHQUFmO1FBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFDTCxvQkFBQztBQUFELENBQUMsQUFsRkQsQ0FBbUMsYUFBYSxHQWtGL0MifQ==