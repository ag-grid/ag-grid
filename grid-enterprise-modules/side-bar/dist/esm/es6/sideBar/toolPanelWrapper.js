var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { HorizontalResizeComp } from "./horizontalResizeComp";
export class ToolPanelWrapper extends Component {
    constructor() {
        super(ToolPanelWrapper.TEMPLATE);
    }
    setupResize() {
        const eGui = this.getGui();
        const resizeBar = this.resizeBar = this.createManagedBean(new HorizontalResizeComp());
        eGui.setAttribute('id', `ag-${this.getCompId()}`);
        resizeBar.setElementToResize(eGui);
        this.appendChild(resizeBar);
    }
    getToolPanelId() {
        return this.toolPanelId;
    }
    setToolPanelDef(toolPanelDef) {
        const { id, minWidth, maxWidth, width } = toolPanelDef;
        this.toolPanelId = id;
        this.width = width;
        const params = {};
        const compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
        const componentPromise = compDetails.newAgStackInstance();
        if (componentPromise == null) {
            console.warn(`AG Grid: error processing tool panel component ${id}. You need to specify 'toolPanel'`);
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));
        if (minWidth != null) {
            this.resizeBar.setMinWidth(minWidth);
        }
        if (maxWidth != null) {
            this.resizeBar.setMaxWidth(maxWidth);
        }
    }
    setToolPanelComponent(compInstance) {
        this.toolPanelCompInstance = compInstance;
        this.appendChild(compInstance.getGui());
        this.addDestroyFunc(() => {
            this.destroyBean(compInstance);
        });
        if (this.width) {
            this.getGui().style.width = `${this.width}px`;
        }
    }
    getToolPanelInstance() {
        return this.toolPanelCompInstance;
    }
    setResizerSizerSide(side) {
        const isRtl = this.gridOptionsService.is('enableRtl');
        const isLeft = side === 'left';
        const inverted = isRtl ? isLeft : !isLeft;
        this.resizeBar.setInverted(inverted);
    }
    refresh() {
        this.toolPanelCompInstance.refresh();
    }
}
ToolPanelWrapper.TEMPLATE = `<div class="ag-tool-panel-wrapper" role="tabpanel"/>`;
__decorate([
    Autowired("userComponentFactory")
], ToolPanelWrapper.prototype, "userComponentFactory", void 0);
__decorate([
    PostConstruct
], ToolPanelWrapper.prototype, "setupResize", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsV3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaWRlQmFyL3Rvb2xQYW5lbFdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxTQUFTLEVBS1QsYUFBYSxFQUVoQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRTlELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxTQUFTO0lBWTNDO1FBQ0ksS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFHTyxXQUFXO1FBQ2YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1FBRXRGLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVsRCxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sY0FBYztRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVNLGVBQWUsQ0FBQyxZQUEwQjtRQUM3QyxNQUFNLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsWUFBWSxDQUFDO1FBRXZELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLE1BQU0sTUFBTSxHQUF3QyxFQUFFLENBQUM7UUFFdkQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1RixNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFELElBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0RBQWtELEVBQUUsbUNBQW1DLENBQUMsQ0FBQztZQUN0RyxPQUFPO1NBQ1Y7UUFDRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTdELElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxZQUE0QjtRQUN0RCxJQUFJLENBQUMscUJBQXFCLEdBQUcsWUFBWSxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUU7WUFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNaLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztJQUVNLG9CQUFvQjtRQUN2QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztJQUN0QyxDQUFDO0lBRU0sbUJBQW1CLENBQUMsSUFBc0I7UUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssTUFBTSxDQUFDO1FBQy9CLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUUxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sT0FBTztRQUNWLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QyxDQUFDOztBQWhGYyx5QkFBUSxHQUNuQixzREFBc0QsQ0FBQztBQUh4QjtJQUFsQyxTQUFTLENBQUMsc0JBQXNCLENBQUM7OERBQW9EO0FBZXRGO0lBREMsYUFBYTttREFTYiJ9