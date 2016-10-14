import {ICellRenderer} from 'ag-grid/main';
import {View} from 'aurelia-templating';
export class AureliaCellRendererComponent implements ICellRenderer{
    private view:View;

    init(params: any){
        let bindingContext = {params:params};
        this.view = params.viewFactory.create(params.container);
        this.view.bind(bindingContext);
    }


    getGui():HTMLElement {
        return this.view.fragment as HTMLElement;
    }

    destroy(){
        this.view.returnToCache();
    }

}