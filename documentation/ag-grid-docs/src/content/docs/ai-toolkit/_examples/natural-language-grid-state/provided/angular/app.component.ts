import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { callChatGPT } from './chatgptApi';
import { IOlympicData, gridOptions } from './gridOptions';
import './styles.css';

ModuleRegistry.registerModules([AllEnterpriseModule]);

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
                            [(ngModel)]="naturalLanguageInput"
                            [disabled]="isProcessing"
                            placeholder="Your prompt e.g. hide age column"
                            name="naturalLanguageInput"
                        />
                        <button type="submit" [disabled]="isProcessing">→</button>
                    </form>
                    <div id="processingStatus" [innerHTML]="processingStatus"></div>
                    <div>
                        <button (click)="resetGrid()">Reset Grid</button>
                    </div>
                </div>

                <div class="response-container">
                    <div id="aiResponse" *ngIf="aiResponse" [innerHTML]="aiResponse"></div>
                    <div id="currentState" *ngIf="currentState" [innerHTML]="currentState"></div>
                </div>
            </div>

            <ag-grid-angular
                #gridRef
                style="height: 100%; width: 100%"
                [columnDefs]="columnDefs"
                [rowData]="rowData"
                [gridOptions]="gridOptions"
            />
        </div>
    `,
})
export class AppComponent implements OnInit, OnDestroy {
    @ViewChild('gridRef') gridRef!: AgGridAngular;

    columnDefs = gridOptions.columnDefs;
    rowData: IOlympicData[] = [];
    gridOptions = gridOptions;

    naturalLanguageInput = '';
    aiResponse = '';
    processingStatus = '';
    currentState = '';
    isProcessing = false;

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => {
                this.rowData = data;
            });
    }

    ngOnDestroy() {
        // AgGridAngular handles cleanup automatically
    }

    async processRequest(event?: Event) {
        event?.preventDefault();

        const userRequest = this.naturalLanguageInput.trim();

        if (!userRequest) {
            this.aiResponse = '<p style="color: red;">Please enter a request</p>';
            return;
        }

        if (!this.gridRef?.api) {
            this.aiResponse = '<p style="color: red;">Grid not initialized</p>';
            return;
        }

        this.isProcessing = true;
        this.processingStatus = '<code class="process">Processing request with ChatGPT <b>⧖</b></code>';
        this.aiResponse = '';

        const currentGridState = this.gridRef.api.getState();

        try {
            const response = await callChatGPT(userRequest, currentGridState, this.gridRef.api);

            if (Object.keys(response.gridState).length > 0) {
                this.gridRef.api.setState(response.gridState, response.propertiesToIgnore);
            }

            this.processingStatus = '<code class="success">Request processed successfully! <b>✓</b></code>';
            this.aiResponse = `
                <i class="prompt">Prompt</i>
                <p class="msg prompt">${userRequest}</p>
                <i class="response">Response</i>
                <p class="msg response">${response.explanation}</p>
            `;

            this.naturalLanguageInput = '';
            this.cdr.detectChanges(); // Force change detection after async operation
        } catch (error) {
            this.processingStatus = '<code class="error">Error processing request <b>✗</b></code>';
            this.aiResponse = `<p>Error: ${error instanceof Error ? error.message : String(error)}</p>`;
            this.cdr.detectChanges(); // Force change detection on error too
        } finally {
            this.isProcessing = false;
            this.cdr.detectChanges(); // Ensure final state is updated
        }
    }

    getCurrentState() {
        if (this.gridRef?.api) {
            const state = this.gridRef.api.getState();
            this.currentState = `<h4>Current Grid State:</h4><pre>${JSON.stringify(state, null, 2)}</pre>`;
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

            this.aiResponse = '';
            this.processingStatus = '';
            this.currentState = '';
        }
    }
}
