import { RefPlaceholder, _clearElement } from 'ag-stack';

import type { GridOptions } from '../../entities/gridOptions';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ProcessFileInputParams } from '../../interfaces/iFileProcessor';
import type { ElementParams } from '../../utils/element';
import { _createElement } from '../../utils/element';
import { _createIconNoSpan } from '../../utils/icon';
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
        { tag: 'div', ref: 'eErrorBanner', cls: 'ag-file-input-error-banner' },
        { tag: 'div', ref: 'eDropZone', cls: 'ag-file-input-drop-zone' },
        { tag: 'div', ref: 'eProcessingState', cls: 'ag-file-input-processing' },
    ],
};

export class FileInputOverlayComponent
    extends OverlayComponent<any, any, IOverlayParams & OverlayComponentUserParams>
    implements IFileInputOverlayComp<any, any>
{
    private readonly eErrorBanner: HTMLElement = RefPlaceholder;
    private readonly eDropZone: HTMLElement = RefPlaceholder;
    private readonly eProcessingState: HTMLElement = RefPlaceholder;

    private state: FileInputState = 'ready';
    private dragCounter: number = 0;
    private processingToken: number = 0;

    public init(params: IFileInputOverlayParams & OverlayComponentUserParams): void {
        this.setTemplate(FileInputOverlayElement);
        this.buildDropZone(params);
        this.showState('ready');
        this.setupDragListeners();
        if (!this.gos.get('processFileInput')) {
            this.beans.log.warn(305);
            this.showError('gridOptions.processFileInput is missing');
        }
    }

    private buildDropZone(params: IFileInputOverlayParams & OverlayComponentUserParams): void {
        const { beans } = this;
        const localeTextFunc = this.getLocaleTextFunc();

        const text =
            params.fileInput?.overlayText ?? localeTextFunc('fileInputOverlay', 'Drag & Drop file to import data');

        const icon = _createIconNoSpan('document', beans, null);
        const textSpan = { tag: 'span', cls: 'ag-file-input-text', children: text } as const;
        const eTextRow = _createElement({
            tag: 'div',
            cls: 'ag-file-input-text-row',
            children: icon ? [() => icon, textSpan] : [textSpan],
        });

        this.eDropZone.appendChild(eTextRow);
        this.appendBrowseButton(this.eDropZone);

        beans.ariaAnnounce.announceValue(text, 'overlay');
    }

    private updateProcessingState(fileName: string): void {
        const { beans } = this;
        const localeTextFunc = this.getLocaleTextFunc();

        _clearElement(this.eProcessingState);

        const eIcon = _createIconNoSpan('overlayLoading', beans, null);
        if (eIcon) {
            eIcon.classList.add('ag-loading-icon');
            this.eProcessingState.appendChild(eIcon);
        }

        const text = localeTextFunc('fileInputProcessing', `Processing ${fileName}`, [fileName]);
        const eText = _createElement({
            tag: 'span',
            cls: 'ag-file-input-text',
            children: text,
        });
        this.eProcessingState.appendChild(eText);

        beans.ariaAnnounce.announceValue(text, 'overlay');
    }

    private showError(message: string): void {
        this.eErrorBanner.textContent = message;
        this.showState('error');
        this.beans.ariaAnnounce.announceValue(message, 'overlay');
    }

    private appendBrowseButton(parent: HTMLElement): void {
        const localeTextFunc = this.getLocaleTextFunc();

        const eFileInput = _createElement<HTMLInputElement>({
            tag: 'input',
            cls: 'ag-file-input-input',
            attrs: { type: 'file', style: 'display:none' },
        });
        this.addManagedElementListeners(eFileInput, { change: () => this.onFileInputChange(eFileInput) });
        parent.appendChild(eFileInput);

        const eButton = _createElement<HTMLButtonElement>({
            tag: 'button',
            cls: 'ag-file-input-browse',
            attrs: { type: 'button' },
            children: localeTextFunc('fileInputOverlayBrowse', 'Browse files'),
        });
        this.addManagedElementListeners(eButton, { click: () => eFileInput.click() });
        parent.appendChild(eButton);
    }

    private showState(state: FileInputState): void {
        this.state = state;
        const eGui = this.getGui();
        _clearElement(eGui);
        switch (state) {
            case 'error':
                eGui.appendChild(this.eErrorBanner);
                eGui.appendChild(this.eDropZone);
                break;
            case 'processing':
                eGui.appendChild(this.eProcessingState);
                break;
            default:
                eGui.appendChild(this.eDropZone);
                break;
        }
    }

    private setupDragListeners(): void {
        const eGui = this.getGui();

        this.addManagedElementListeners(eGui, {
            dragenter: (e: DragEvent) => {
                if (!this.isFileDrag(e)) {
                    return;
                }
                e.preventDefault();
                this.dragCounter++;
                if (this.dragCounter === 1) {
                    this.eDropZone.classList.add('ag-file-input-drop-zone-active');
                }
            },
            dragover: (e: DragEvent) => {
                if (!this.isFileDrag(e)) {
                    return;
                }
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'copy';
                }
            },
            dragleave: (e: DragEvent) => {
                if (!this.isFileDrag(e)) {
                    return;
                }
                e.preventDefault();
                this.dragCounter--;
                if (this.dragCounter <= 0) {
                    this.dragCounter = 0;
                    this.eDropZone.classList.remove('ag-file-input-drop-zone-active');
                }
            },
            drop: (e: DragEvent) => {
                if (!this.isFileDrag(e)) {
                    return;
                }
                e.preventDefault();
                this.dragCounter = 0;
                this.eDropZone.classList.remove('ag-file-input-drop-zone-active');

                this.handleFileList(e.dataTransfer?.files);
            },
        });
    }

    private isFileDrag(e: DragEvent): boolean {
        return e.dataTransfer?.types?.includes('Files') ?? false;
    }

    private onFileInputChange(eFileInput: HTMLInputElement): void {
        this.handleFileList(eFileInput.files);
        eFileInput.value = '';
    }

    private handleFileList(files: FileList | null | undefined): void {
        if (files && files.length > 0) {
            this.handleFiles(Array.from(files));
        }
    }

    private handleFiles(files: File[]): void {
        if (this.state === 'processing') {
            return;
        }

        const { gos } = this;
        const processFileInput = gos.get('processFileInput');

        const fileName = files[0].name;
        this.updateProcessingState(fileName);
        this.showState('processing');

        const token = ++this.processingToken;

        const success = (rowData: any[]) => {
            if (!this.isAlive() || token !== this.processingToken) {
                return;
            }
            const options: GridOptions = { rowData };
            if (gos.get('activeOverlay') === 'agFileInputOverlay') {
                options.activeOverlay = undefined;
            }
            gos.updateGridOptions({ options, source: 'api' });
        };

        const fail = (errorMessage?: string) => {
            if (!this.isAlive() || token !== this.processingToken) {
                return;
            }
            const localeTextFunc = this.getLocaleTextFunc();
            const message =
                errorMessage ?? localeTextFunc('fileInputProcessingFailed', `Error processing ${fileName}`, [fileName]);
            this.showError(message);
        };

        if (!processFileInput) {
            fail();
        } else {
            try {
                processFileInput(_addGridCommonParams<ProcessFileInputParams>(gos, { files, success, fail }));
            } catch (error) {
                fail(error instanceof Error ? error.message : undefined);
            }
        }
    }
}
