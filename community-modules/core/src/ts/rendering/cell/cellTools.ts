import { CheckboxSelectionComponent } from "../checkboxSelectionComponent";
import { RowNode } from "../../entities/rowNode";
import { Column } from "../../entities/column";
import { Beans } from "../beans";

export class CellTools {

    public createSelectionCheckbox(rowNode: RowNode, column: Column, beans: Beans): CheckboxSelectionComponent {
        const cbSelectionComponent = new CheckboxSelectionComponent();
        beans.context.createBean(cbSelectionComponent);

        cbSelectionComponent.init({ rowNode, column });

        // put the checkbox in before the value
        return cbSelectionComponent;
    }

}