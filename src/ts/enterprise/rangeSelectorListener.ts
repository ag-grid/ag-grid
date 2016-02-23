import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import GridPanel from "../gridPanel/gridPanel";
import {PostConstruct} from "../context/context";

@Bean('rangeSelectorListener')
export class RangeSelectorListener {

    @Autowired('gridPanel') gridPanel: GridPanel;

    @PostConstruct
    private init(): void {

        var leftViewport = this.gridPanel.getPinnedLeftColsViewport();
        var rightViewport = this.gridPanel.getPinnedRightColsViewport();
        var centerViewport = this.gridPanel.getCenterColsViewport();

        leftViewport.addEventListener('mousemove', ()=> {

        });

    }

    //public startDrag(): void {
    //
    //    this.logger.log('startDrag');
    //    this.dragSource.dragItem.setMoving(true);
    //    this.dragging = true;
    //    this.dragItem = this.dragSource.dragItem;
    //    this.lastDropTarget = this.dragSource.dragSourceDropTarget;
    //
    //    this.createGhost();
    //}

}