import { RefPlaceholder, _clearElement, _setDisplayed } from 'ag-stack';

import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { IFileProcessorParams } from '../../interfaces/iFileProcessor';
import type { ElementParams } from '../../utils/element';
import { _createElement } from '../../utils/element';
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

    private eFileInput: HTMLInputElement | undefined;
    private state: FileInputState = 'ready';
    private dragCounter: number = 0;

    public init(params: IFileInputOverlayParams & OverlayComponentUserParams): void {
        this.setTemplate(FileInputOverlayElement);
        this.buildDropZone(params);
        this.showState('ready');
        this.setupDragListeners();
        if (!this.gos.get('fileProcessor')) {
            _warn(305);
            this.eErrorBanner.textContent = 'gridOptions.fileProcessor is missing';
            this.showState('error');
        }
    }

    public override destroy(): void {
        this.eFileInput = undefined;
        super.destroy();
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

        const eText = _createElement({
            tag: 'span',
            cls: 'ag-file-input-text',
            children: localeTextFunc('fileInputProcessing', `Processing ${fileName}`, [fileName]),
        });
        this.eProcessingState.appendChild(eText);
    }

    private appendBrowseButton(parent: HTMLElement): void {
        const localeTextFunc = this.getLocaleTextFunc();

        const eFileInput = _createElement<HTMLInputElement>({
            tag: 'input',
            cls: 'ag-file-input-input',
            attrs: { type: 'file', style: 'display:none' },
        });
        eFileInput.addEventListener('change', () => this.onFileInputChange(eFileInput));
        parent.appendChild(eFileInput);

        if (!this.eFileInput) {
            this.eFileInput = eFileInput;
        }

        const eButton = _createElement<HTMLButtonElement>({
            tag: 'button',
            cls: 'ag-file-input-browse',
            attrs: { type: 'button' },
            children: localeTextFunc('fileInputOverlayBrowse', 'Browse files'),
        });
        eButton.addEventListener('click', () => eFileInput.click());
        parent.appendChild(eButton);
    }

    private showState(state: FileInputState): void {
        this.state = state;
        _setDisplayed(this.eErrorBanner, state === 'error');
        _setDisplayed(this.eDropZone, state !== 'processing');
        _setDisplayed(this.eProcessingState, state === 'processing');
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
                this.eDropZone.classList.add('ag-file-input-drop-zone-active');
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
                this.eDropZone.classList.remove('ag-file-input-drop-zone-active');
            }
        });

        eGui.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            this.dragCounter = 0;
            this.eDropZone.classList.remove('ag-file-input-drop-zone-active');

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

        const { gos, beans } = this;
        const fileProcessor = gos.get('fileProcessor');

        const fileName = files[0].name;
        this.updateProcessingState(fileName);
        this.showState('processing');
        const processingText = this.getLocaleTextFunc()('fileInputProcessing', 'Processing ${variable}', [fileName]);
        beans.ariaAnnounce.announceValue(processingText, 'overlay');

        const success = (rowData: any[]) => {
            gos.updateGridOptions({ options: { rowData }, source: 'api' });
        };

        const fail = (errorMessage?: string) => {
            const localeTextFunc = this.getLocaleTextFunc();
            const message =
                errorMessage ?? localeTextFunc('fileInputProcessingFailed', `Error processing ${fileName}`, [fileName]);
            this.eErrorBanner.textContent = message;
            this.showState('error');
            beans.ariaAnnounce.announceValue(message, 'overlay');
        };

        if (!fileProcessor) {
            fail();
        } else {
            fileProcessor.processFiles(_addGridCommonParams<IFileProcessorParams>(gos, { files, success, fail }));
        }
    }
}
