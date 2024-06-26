import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { OverlayWrapperComponent } from './overlayWrapperComponent';
export declare class OverlayService extends BeanStub implements NamedBean {
    beanName: "overlayService";
    private userComponentFactory;
    private rowModel;
    private columnModel;
    private state;
    private showInitialOverlay;
    wireBeans(beans: BeanCollection): void;
    private overlayWrapperComp;
    postConstruct(): void;
    registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void;
    showLoadingOverlay(): void;
    showNoRowsOverlay(): void;
    hideOverlay(): void;
    private updateOverlayVisibility;
    private doShowLoadingOverlay;
    private doShowNoRowsOverlay;
    private doHideOverlay;
    private showOverlay;
}
