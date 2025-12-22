import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import type {
    IExportingOverlayParams,
    IOverlay,
    IOverlayComp,
    IOverlayParams,
    OverlayComponentUserParams,
} from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface IExportingOverlay<TData = any, TContext = any>
    extends IOverlay<TData, TContext, IExportingOverlayParams<TData, TContext>> {}

export interface IExportingOverlayComp<TData = any, TContext = any>
    extends IOverlayComp<TData, TContext, IExportingOverlayParams<TData, TContext>> {}

const ExportingOverlayElement: ElementParams = {
    tag: 'div',
    cls: 'ag-overlay-exporting-center',
    children: [
        { tag: 'span', ref: 'eExportingIcon', cls: 'ag-loading-icon' },
        { tag: 'span', ref: 'eExportingText', cls: 'ag-exporting-text' },
    ],
};
export class ExportingOverlayComponent
    extends OverlayComponent<any, any, IOverlayParams & OverlayComponentUserParams>
    implements IExportingOverlayComp<any, any>
{
    private readonly eExportingIcon: HTMLElement = RefPlaceholder;
    private readonly eExportingText: HTMLElement = RefPlaceholder;

    public init(params: IExportingOverlayParams & OverlayComponentUserParams): void {
        const { beans } = this;

        this.setTemplate(ExportingOverlayElement);

        const eExportingIcon = _createIconNoSpan('overlayExporting', beans, null);
        if (eExportingIcon) {
            this.eExportingIcon.appendChild(eExportingIcon);
        }
        const exportingText = params.exporting?.overlayText ?? this.getLocaleTextFunc()('exportingOoo', 'Exporting...');
        this.eExportingText.textContent = exportingText;
        beans.ariaAnnounce.announceValue(exportingText, 'overlay');
    }
}
