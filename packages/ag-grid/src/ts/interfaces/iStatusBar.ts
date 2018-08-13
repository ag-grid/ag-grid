import {Promise} from "../utils";
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnApi";

export interface IStatusBarParams {
    api: GridApi,
    columnApi: ColumnApi,
    context: any,
}

export interface IStatusBar<IStatusBarParams> {
    /** Return the DOM element of your component, this is what the grid puts into the DOM */
    getGui(): HTMLElement;

    /** Gets called once by grid when destroying the component - do any necessary cleanup here  */
    destroy?(): void;

    /** The init(params) method is called on the component once. See below for details on the parameters. */
    init?(params: IStatusBarParams): Promise<void> | void;
}
