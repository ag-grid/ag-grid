import {autoinject, Container, transient, View, ViewFactory} from "aurelia-framework";

import {ICellRendererComp, ICellEditorComp} from "ag-grid/main";

import {IAureliaEditorViewModel} from "./editorViewModels";

@autoinject()
@transient()
export class AureliaComponentFactory {
    public createRendererFromTemplate(container: Container, viewFactory: ViewFactory): {new(): ICellRendererComp} {
        class CellRendererComponent implements ICellRendererComp {
            private view: View;

            init(params: any) {
                let bindingContext = {params: params};
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);
            }

            getGui(): HTMLElement {
                return this.view.fragment as HTMLElement;
            }

            destroy() {
                this.view.returnToCache();
            }

        }

        return CellRendererComponent;
    }

    public createEditorFromTemplate(container: Container, viewFactory: ViewFactory): {new(): ICellEditorComp} {

        class CellEditor implements ICellEditorComp {

            private view: View;
            private editorVm: IAureliaEditorViewModel;


            init(params: any): void {
                let bindingContext = {params: params};
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);

                let controllers: any[] = (<any> this.view).controllers;

                //only one controller is allowed in editor template
                if (controllers &&
                    controllers.length == 1 &&
                    controllers[0].viewModel) {
                    this.editorVm = controllers[0].viewModel;
                    //this is a 'hack' because we don't have params.bind="" in the template
                    //must reset params or it will be nothing
                    this.editorVm.params = params;
                }
                else {
                    console.error('The editor template component is missing an IEditorViewModel or it contains more than one component');
                }
            }

            public afterGuiAttached() {
                this.view.attached();
            }

            public getGui(): HTMLElement {
                return this.view.fragment as HTMLElement;
            }

            destroy() {
                if (this.editorVm.destroy) {
                    this.editorVm.destroy();
                }
                this.view.returnToCache();
            }

            getValue(): any {
                return this.editorVm.getValue();
            }

            isPopup(): boolean {
                return this.editorVm.isPopup ?
                    this.editorVm.isPopup() : false;
            }

            isCancelBeforeStart(): boolean {
                return this.editorVm.isCancelBeforeStart ?
                    this.editorVm.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd(): boolean {
                return this.editorVm.isCancelAfterEnd ?
                    this.editorVm.isCancelAfterEnd() : false;
            }

            focusIn(): void {
                if (this.editorVm.focusIn) {
                    this.editorVm.focusIn();
                }
            }

            focusOut(): void {
                if (this.editorVm.focusOut) {
                    this.editorVm.focusOut();
                }
            }

        }

        return CellEditor;
    }
}