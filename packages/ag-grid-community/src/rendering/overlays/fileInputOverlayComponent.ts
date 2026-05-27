import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import type { FileInputEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ElementParams } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
import { _warn } from '../../validation/logging';
import type {
    IFileInputOverlayParams,
    IOverlay,
    IOverlayComp,
    IOverlayParams,
    OverlayComponentUserParams,
} from './overlayComponent';
import { OverlayComponent } from './overlayComponent';

export interface IFileInputOverlay<TData = any, TContext = any> extends IOverlay<
    TData,
    TContext,
    IFileInputOverlayParams<TData, TContext>
> {}

export interface IFileInputOverlayComp<TData = any, TContext = any> extends IOverlayComp<
    TData,
    TContext,
    IFileInputOverlayParams<TData, TContext>
> {}

type FileInputState = 'ready' | 'processing' | 'error';

const FileInputOverlayElement: ElementParams = {
    tag: 'div',
    cls: 'ag-overlay-file-input-center',
    children: [
        { tag: 'div', ref: 'eReadyState', cls: 'ag-file-input-ready' },
        { tag: 'div', ref: 'eProcessingState', cls: 'ag-file-input-processing' },
        { tag: 'div', ref: 'eErrorState', cls: 'ag-file-input-error' },
    ],
};

export class FileInputOverlayComponent
    extends OverlayComponent<any, any, IOverlayParams & OverlayComponentUserParams>
    implements IFileInputOverlayComp<any, any>
{
    private readonly eReadyState: HTMLElement = RefPlaceholder;
    private readonly eProcessingState: HTMLElement = RefPlaceholder;
    private readonly eErrorState: HTMLElement = RefPlaceholder;

    private eFileInput: HTMLInputElement | undefined;
    private state: FileInputState = 'ready';
    private dragCounter: number = 0;

    public init(params: IFileInputOverlayParams & OverlayComponentUserParams): void {
        this.setTemplate(FileInputOverlayElement);
        this.buildReadyState(params);
        this.buildProcessingState();
        this.buildErrorState();
        this.showState('ready');
        this.setupDragListeners();
    }

    public refresh(): void {}

    public override destroy(): void {
        this.eFileInput = undefined;
        super.destroy();
    }

    private buildReadyState(params: IFileInputOverlayParams & OverlayComponentUserParams): void {
        const { beans } = this;
        const localeTextFunc = this.getLocaleTextFunc();

        const text = params.fileInput?.overlayText ?? localeTextFunc('fileInputOverlay', 'Drop files here');
        const eText = document.createElement('span');
        eText.classList.add('ag-file-input-text');
        eText.textContent = text;
        this.eReadyState.appendChild(eText);

        const eOr = document.createElement('span');
        eOr.classList.add('ag-file-input-or');
        eOr.textContent = localeTextFunc('fileInputOverlayOr', 'or');
        this.eReadyState.appendChild(eOr);

        this.appendBrowseButton(this.eReadyState);

        beans.ariaAnnounce.announceValue(text, 'overlay');
    }

    private buildProcessingState(): void {
        const { beans } = this;
        const localeTextFunc = this.getLocaleTextFunc();

        const eIcon = _createIconNoSpan('overlayLoading', beans, null);
        if (eIcon) {
            eIcon.classList.add('ag-loading-icon');
            this.eProcessingState.appendChild(eIcon);
        }

        const eText = document.createElement('span');
        eText.classList.add('ag-file-input-text');
        eText.textContent = localeTextFunc('fileInputProcessing', 'Processing file...');
        this.eProcessingState.appendChild(eText);
    }

    private buildErrorState(): void {
        const localeTextFunc = this.getLocaleTextFunc();

        const eMessage = document.createElement('span');
        eMessage.classList.add('ag-file-input-error-message');
        this.eErrorState.appendChild(eMessage);

        const eHint = document.createElement('span');
        eHint.classList.add('ag-file-input-hint');
        eHint.textContent = localeTextFunc('fileInputTryAgain', 'Try again by dropping or selecting a new file');
        this.eErrorState.appendChild(eHint);

        this.appendBrowseButton(this.eErrorState);
    }

    private appendBrowseButton(parent: HTMLElement): void {
        const localeTextFunc = this.getLocaleTextFunc();

        const eFileInput = document.createElement('input');
        eFileInput.type = 'file';
        eFileInput.classList.add('ag-file-input-input');
        eFileInput.style.display = 'none';
        eFileInput.addEventListener('change', () => this.onFileInputChange(eFileInput));
        parent.appendChild(eFileInput);

        if (!this.eFileInput) {
            this.eFileInput = eFileInput;
        }

        const eButton = document.createElement('button');
        eButton.classList.add('ag-file-input-browse');
        eButton.type = 'button';
        eButton.textContent = localeTextFunc('fileInputOverlayBrowse', 'Browse files');
        eButton.addEventListener('click', () => eFileInput.click());
        parent.appendChild(eButton);
    }

    private showState(state: FileInputState): void {
        this.state = state;
        this.eReadyState.style.display = state === 'ready' ? '' : 'none';
        this.eProcessingState.style.display = state === 'processing' ? '' : 'none';
        this.eErrorState.style.display = state === 'error' ? '' : 'none';
    }

    private setupDragListeners(): void {
        const eGui = this.getGui();

        eGui.addEventListener('dragenter', (e: DragEvent) => {
            if (!this.isFileDrag(e)) {
                return;
            }
            e.preventDefault();
            this.dragCounter++;
            if (this.dragCounter === 1) {
                eGui.classList.add('ag-file-input-active');
            }
        });

        eGui.addEventListener('dragover', (e: DragEvent) => {
            if (!this.isFileDrag(e)) {
                return;
            }
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        eGui.addEventListener('dragleave', (e: DragEvent) => {
            if (!this.isFileDrag(e)) {
                return;
            }
            e.preventDefault();
            this.dragCounter--;
            if (this.dragCounter <= 0) {
                this.dragCounter = 0;
                eGui.classList.remove('ag-file-input-active');
            }
        });

        eGui.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            this.dragCounter = 0;
            eGui.classList.remove('ag-file-input-active');

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                this.handleFiles(Array.from(files));
            }
        });
    }

    private isFileDrag(e: DragEvent): boolean {
        return e.dataTransfer?.types?.includes('Files') ?? false;
    }

    private onFileInputChange(eFileInput: HTMLInputElement): void {
        const files = eFileInput.files;
        if (files && files.length > 0) {
            this.handleFiles(Array.from(files));
        }
        eFileInput.value = '';
    }

    private handleFiles(files: File[]): void {
        if (this.state === 'processing') {
            return;
        }

        if (!this.gos.exists('onFileInput')) {
            _warn(304);
            this.showError(this.getLocaleTextFunc()('fileInputNoHandler', 'No file handler configured'));
            return;
        }

        this.showState('processing');
        this.beans.ariaAnnounce.announceValue(
            this.getLocaleTextFunc()('fileInputProcessing', 'Processing file...'),
            'overlay'
        );

        const resolve = (rowData: any[]) => {
            this.gos.updateGridOptions({ options: { rowData }, source: 'api' });
        };

        const reject = (errorMessage: string) => {
            this.showError(errorMessage);
        };

        this.eventSvc.dispatchEvent(
            _addGridCommonParams<FileInputEvent>(this.gos, { type: 'fileInput', files, resolve, reject })
        );
    }

    private showError(errorMessage: string): void {
        const eMessage = this.eErrorState.querySelector('.ag-file-input-error-message');
        if (eMessage) {
            eMessage.textContent = errorMessage;
        }
        this.showState('error');
        this.beans.ariaAnnounce.announceValue(errorMessage, 'overlay');
    }
}
