import { Component } from '../../widgets/component';
export declare class HeaderRowContainerComp extends Component {
    private static PINNED_LEFT_TEMPLATE;
    private static PINNED_RIGHT_TEMPLATE;
    private static CENTER_TEMPLATE;
    private eCenterContainer;
    private eRowContainer;
    private pinned;
    private headerRowComps;
    private rowCompsList;
    constructor(pinned: string | null);
    private init;
    private selectAndSetTemplate;
    private destroyRowComps;
    private destroyRowComp;
    private setCtrls;
}
