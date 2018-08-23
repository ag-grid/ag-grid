import {Component, ViewChild, ViewContainerRef} from "@angular/core";

import {IFilterParams} from "ag-grid-community";
import {IFilterAngularComp} from "ag-grid-angular";

@Component({
    selector: 'filter-cell',
    template: `
        <div class="full-width-panel"> 
            <div class="full-width-flag"> 
                <img border="0" [src]="flag"> 
            </div> 
            <div class="full-width-summary"> 
                <span class="full-width-title">{{data.name}}</span>
                <br/>
                <label>
                    <b>Population:</b>
                    {{data.population}} 
                </label>
                <br/> 
                <label>
                    <b>Known For:</b>  
                    {{data.summary}} 
                </label>
                <br/> 
            </div> 
            <div class="full-width-center" (mousewheel)="mouseWheelListener($event)" (DOMMouseScroll)="mouseWheelListener($event)"> 
                {{latinText()}} 
            </div> 
        </div>
    `, styles: [
        `
            .full-width-panel {
                /* undo the white-space setting Fresh puts in */
                white-space: normal;
                height: 100%;
                width: 100%;
                border: 2px solid grey;
                border-style: ridge;
                box-sizing: border-box;
                padding: 5px;
                background-color: darkgray;
            }
            .full-width-flag {
                float: left;
                padding: 6px;
            }
            .full-width-summary {
                float: left;
                /*margin-left: 10px;*/
                margin-right: 10px;
            }
            .full-width-panel label {
                padding-top: 3px;
                display: inline-block;
                font-size: 12px;
            }
            .full-width-center {
                overflow-y: scroll;
                border: 1px solid grey;
                padding: 2px;
                height: 100%;
                box-sizing: border-box;
                font-family: cursive;
                background-color: #fafafa;
            }
            .full-width-center p {
                margin-top: 0px;
            }
            .full-width-title {
                font-size: 20px;
            }
        `
    ]
})
export class FullWidthCellRenderer implements IFilterAngularComp {
    private data: any;
    private flag: string;

    agInit(params: IFilterParams): void {
        this.data = params.node.data;
        this.flag = `https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/largeFlags/${this.data.code}.png`;
    }

    mouseWheelListener(event) {
        event.stopPropagation();
    };

    latinText() {
        return '<p>Sample Text in a Paragraph</p><p>Lorem ipsum dolor sit amet, his mazim necessitatibus te, mea volutpat intellegebat at. Ea nec perpetua liberavisse, et modo rebum persius pri. Velit recteque reprimique quo at. Vis ex persius oporteat, esse voluptatum moderatius te vis. Ex agam suscipit aliquando eum. Mediocrem molestiae id pri, ei cibo facilisis mel. Ne sale nonumy sea. Et vel lorem omittam vulputate. Ne prima impedit percipitur vis, erat summo an pro. Id urbanitas deterruisset cum, at legere oportere has. No saperet lobortis elaboraret qui, alii zril at vix, nulla soluta ornatus per ad. Feugiat consequuntur vis ad, te sit quodsi persequeris, labore perpetua mei ad. Ex sea affert ullamcorper disputationi, sit nisl elit elaboraret te, quodsi doctus verear ut eam. Eu vel malis nominati, per ex melius delenit incorrupte. Partem complectitur sed in. Vix dicta tincidunt ea. Id nec urbanitas voluptaria, pri no nostro disputationi. Falli graeco salutatus pri ea.</p><p>Quo ad omnesque phaedrum principes, tale urbanitas constituam et ius, pericula consequat ad est. Ius tractatos referrentur deterruisset an, odio consequuntur sed ad. Ea molestie adipiscing adversarium eos, tale veniam sea no. Mutat nullam philosophia sed ad. Pri eu dicta consulatu, te mollis quaerendum sea. Ei doming commodo euismod vis. Cu modus aliquip inermis his, eos et eirmod regione delicata, at odio definiebas vis.</p><p>Lorem ipsum dolor sit amet, his mazim necessitatibus te, mea volutpat intellegebat at. Ea nec perpetua liberavisse, et modo rebum persius pri. Velit recteque reprimique quo at. Vis ex persius oporteat, esse voluptatum moderatius te vis. Ex agam suscipit aliquando eum. Mediocrem molestiae id pri, ei cibo facilisis mel. Ne sale nonumy sea. Et vel lorem omittam vulputate. Ne prima impedit percipitur vis, erat summo an pro. Id urbanitas deterruisset cum, at legere oportere has. No saperet lobortis elaboraret qui, alii zril at vix, nulla soluta ornatus per ad. Feugiat consequuntur vis ad, te sit quodsi persequeris, labore perpetua mei ad. Ex sea affert ullamcorper disputationi, sit nisl elit elaboraret te, quodsi doctus verear ut eam. Eu vel malis nominati, per ex melius delenit incorrupte. Partem complectitur sed in. Vix dicta tincidunt ea. Id nec urbanitas voluptaria, pri no nostro disputationi. Falli graeco salutatus pri ea.</p><p>Quo ad omnesque phaedrum principes, tale urbanitas constituam et ius, pericula consequat ad est. Ius tractatos referrentur deterruisset an, odio consequuntur sed ad. Ea molestie adipiscing adversarium eos, tale veniam sea no. Mutat nullam philosophia sed ad. Pri eu dicta consulatu, te mollis quaerendum sea. Ei doming commodo euismod vis. Cu modus aliquip inermis his, eos et eirmod regione delicata, at odio definiebas vis.</p>';
    }
}
