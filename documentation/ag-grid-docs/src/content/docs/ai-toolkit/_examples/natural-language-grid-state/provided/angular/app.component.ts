import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { callChatGPT } from './chatgptApi';
import { IOlympicData, gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface ChatMessage {
    prompt: string;
    response: string;
}

interface ProcessingState {
    isProcessing: boolean;
    status: 'idle' | 'processing' | 'success' | 'error';
    message: string;
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [CommonModule, FormsModule, AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <div class="request-container">
                    <form class="input-group" (ngSubmit)="processRequest($event)">
                        <input
                            type="text"
                            [ngModel]="naturalLanguageInput()"
                            (ngModelChange)="naturalLanguageInput.set($event)"
                            [disabled]="processingState().isProcessing"
                            placeholder="Your prompt e.g. hide age column"
                            name="naturalLanguageInput"
                        />
                        <button type="submit" [disabled]="processingState().isProcessing">→</button>
                    </form>

                    <div id="processingStatus" *ngIf="processingState().message">
                        <code
                            [class.process]="processingState().status === 'processing'"
                            [class.success]="processingState().status === 'success'"
                            [class.error]="processingState().status === 'error'"
                        >
                            {{ processingState().message }}
                            <b *ngIf="processingState().status === 'processing'">⧖</b>
                            <b *ngIf="processingState().status === 'success'">✓</b>
                            <b *ngIf="processingState().status === 'error'">✗</b>
                        </code>
                    </div>

                    <div>
                        <button (click)="resetGrid()">Reset Grid</button>
                    </div>
                </div>

                <div class="response-container">
                    <div id="aiResponse" *ngIf="chatMessage()">
                        <i class="prompt">Prompt</i>
                        <p class="msg prompt">{{ chatMessage()?.prompt }}</p>
                        <i class="response">Response</i>
                        <p class="msg response">{{ chatMessage()?.response }}</p>
                    </div>
                </div>
            </div>

            <ag-grid-angular
                #gridRef
                style="flex: 1;"
                [columnDefs]="columnDefs"
                [rowData]="rowData()"
                [gridOptions]="gridOptions"
            />
        </div>
    `,
})
export class AppComponent implements OnInit, OnDestroy {
    @ViewChild('gridRef') gridRef!: AgGridAngular;

    columnDefs = gridOptions.columnDefs;
    rowData = signal<IOlympicData[]>([]);
    gridOptions = gridOptions;

    naturalLanguageInput = signal('');
    chatMessage = signal<ChatMessage | null>(null);
    currentState = signal('');
    processingState = signal<ProcessingState>({
        isProcessing: false,
        status: 'idle',
        message: '',
    });

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => {
                this.rowData.set(data);
            });
    }

    ngOnDestroy() {
        // AgGridAngular handles cleanup automatically
    }

    async processRequest(event?: Event) {
        event?.preventDefault();

        const userRequest = this.naturalLanguageInput().trim();

        if (!userRequest) {
            this.processingState.set({
                isProcessing: false,
                status: 'error',
                message: 'Please enter a request',
            });
            return;
        }

        if (!this.gridRef?.api) {
            this.processingState.set({
                isProcessing: false,
                status: 'error',
                message: 'Grid not initialized',
            });
            return;
        }

        this.processingState.set({
            isProcessing: true,
            status: 'processing',
            message: 'Processing request with ChatGPT',
        });
        this.chatMessage.set(null);

        const currentGridState = this.gridRef.api.getState();

        try {
            const response = await callChatGPT(userRequest, currentGridState, this.gridRef.api);

            if (Object.keys(response.gridState).length > 0) {
                this.gridRef.api.setState(response.gridState, response.propertiesToIgnore);
            }

            this.processingState.set({
                isProcessing: false,
                status: 'success',
                message: 'Request processed successfully!',
            });

            this.chatMessage.set({
                prompt: userRequest,
                response: response.explanation,
            });

            this.naturalLanguageInput.set('');
        } catch (error) {
            this.processingState.set({
                isProcessing: false,
                status: 'error',
                message: `Error: ${error instanceof Error ? error.message : String(error)}`,
            });
        }
    }

    getCurrentState() {
        if (this.gridRef?.api) {
            const state = this.gridRef.api.getState();
            this.currentState.set(JSON.stringify(state, null, 2));
        }
    }

    resetGrid() {
        if (this.gridRef?.api) {
            this.gridRef.api.setState({
                columnVisibility: { hiddenColIds: [] },
                columnPinning: { leftColIds: [], rightColIds: [] },
                sort: { sortModel: [] },
                filter: { filterModel: {} },
                rowGroup: { groupColIds: [] },
                pagination: { page: 0, pageSize: 20 },
            });

            this.chatMessage.set(null);
            this.processingState.set({
                isProcessing: false,
                status: 'idle',
                message: '',
            });
            this.currentState.set('');
        }
    }
}
