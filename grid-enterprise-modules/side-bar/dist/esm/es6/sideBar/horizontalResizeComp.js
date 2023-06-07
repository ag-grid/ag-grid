var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, Events } from "@ag-grid-community/core";
export class HorizontalResizeComp extends Component {
    constructor() {
        super(/* html */ `<div class="ag-tool-panel-horizontal-resize"></div>`);
        this.minWidth = 100;
        this.maxWidth = null;
    }
    setElementToResize(elementToResize) {
        this.elementToResize = elementToResize;
    }
    postConstruct() {
        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.getGui(),
            dragStartPixels: 1,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this),
            onResizeEnd: this.onResizeEnd.bind(this)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        this.setInverted(this.gridOptionsService.is('enableRtl'));
    }
    dispatchResizeEvent(start, end, width) {
        const event = {
            type: Events.EVENT_TOOL_PANEL_SIZE_CHANGED,
            width: width,
            started: start,
            ended: end,
        };
        this.eventService.dispatchEvent(event);
    }
    onResizeStart() {
        this.startingWidth = this.elementToResize.offsetWidth;
        this.dispatchResizeEvent(true, false, this.startingWidth);
    }
    onResizeEnd(delta) {
        return this.onResizing(delta, true);
    }
    onResizing(delta, isEnd = false) {
        const direction = this.inverted ? -1 : 1;
        let newWidth = Math.max(this.minWidth, Math.floor(this.startingWidth - (delta * direction)));
        if (this.maxWidth != null) {
            newWidth = Math.min(this.maxWidth, newWidth);
        }
        this.elementToResize.style.width = `${newWidth}px`;
        this.dispatchResizeEvent(false, isEnd, newWidth);
    }
    setInverted(inverted) {
        this.inverted = inverted;
    }
    setMaxWidth(value) {
        this.maxWidth = value;
    }
    setMinWidth(value) {
        if (value != null) {
            this.minWidth = value;
        }
        else {
            this.minWidth = 100;
        }
    }
}
__decorate([
    Autowired('horizontalResizeService')
], HorizontalResizeComp.prototype, "horizontalResizeService", void 0);
__decorate([
    PostConstruct
], HorizontalResizeComp.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9yaXpvbnRhbFJlc2l6ZUNvbXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2lkZUJhci9ob3Jpem9udGFsUmVzaXplQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULFNBQVMsRUFFVCxhQUFhLEVBR2IsTUFBTSxFQUNULE1BQU0seUJBQXlCLENBQUM7QUFFakMsTUFBTSxPQUFPLG9CQUFxQixTQUFRLFNBQVM7SUFVL0M7UUFDSSxLQUFLLENBQUMsVUFBVSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7UUFKcEUsYUFBUSxHQUFXLEdBQUcsQ0FBQztRQUN2QixhQUFRLEdBQWtCLElBQUksQ0FBQztJQUl2QyxDQUFDO0lBRU0sa0JBQWtCLENBQUMsZUFBNEI7UUFDbEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztJQUdPLGFBQWE7UUFDakIsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDO1lBQ3JFLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3pCLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDNUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN0QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQzNDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsS0FBYyxFQUFFLEdBQVksRUFBRSxLQUFhO1FBQ25FLE1BQU0sS0FBSyxHQUFpRDtZQUN4RCxJQUFJLEVBQUUsTUFBTSxDQUFDLDZCQUE2QjtZQUMxQyxLQUFLLEVBQUUsS0FBSztZQUNaLE9BQU8sRUFBRSxLQUFLO1lBQ2QsS0FBSyxFQUFFLEdBQUc7U0FDYixDQUFDO1FBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUMsQ0FBQztJQUVPLGFBQWE7UUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztRQUN0RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLFdBQVcsQ0FBQyxLQUFhO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLFVBQVUsQ0FBQyxLQUFhLEVBQUUsUUFBaUIsS0FBSztRQUNwRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTdGLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDdkIsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLFFBQVEsSUFBSSxDQUFDO1FBQ25ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTSxXQUFXLENBQUMsUUFBaUI7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFvQjtRQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRU0sV0FBVyxDQUFDLEtBQW9CO1FBQ25DLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1NBQ3pCO2FBQU07WUFDSCxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztTQUN2QjtJQUNMLENBQUM7Q0FDSjtBQTNFeUM7SUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO3FFQUEwRDtBQWlCL0Y7SUFEQyxhQUFhO3lEQVliIn0=