import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { FindPart, ICellRendererParams } from 'ag-grid-community';

import { getLatinText } from './data';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="full-width-panel">
            <div class="full-width-flag">
                <img border="0" [src]="flag()" />
            </div>
            <div class="full-width-summary">
                <span class="full-width-title">{{ data()?.name }}</span>
                <br />
                <label>
                    <b>Population:</b>
                    {{ data()?.population }}
                </label>
                <br />
                <label>
                    <b>Language:</b>
                    {{ data()?.language }}
                </label>
                <br />
            </div>
            <div class="full-width-center">
                <p>
                    @for (part of sampleTextParts(); track $index) {
                        @if (part.match) {
                            <mark [class]="{ 'ag-find-match': true, 'ag-find-active-match': part.activeMatch }">{{
                                part.value
                            }}</mark>
                        } @else {
                            <ng-container>{{ part.value }}</ng-container>
                        }
                    }
                </p>
                <p>
                    @for (part of latinTextParts(); track $index) {
                        @if (part.match) {
                            <mark [class]="{ 'ag-find-match': true, 'ag-find-active-match': part.activeMatch }">{{
                                part.value
                            }}</mark>
                        } @else {
                            <ng-container>{{ part.value }}</ng-container>
                        }
                    }
                </p>
            </div>
        </div>
    `,
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    sampleTextParts = signal<FindPart[]>([]);
    latinTextParts = signal<FindPart[]>([]);
    data = signal<any>(undefined);
    flag = computed(() =>
        this.data()?.code ? `https://www.ag-grid.com/example-assets/large-flags/${this.data().code}.png` : ''
    );

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        const { api, node } = params;
        this.data.set(node.data);
        const originalSampleText = 'Sample Text in a Paragraph';
        const originalLatinText = getLatinText();
        const sampleTextParts = api.findGetParts({
            value: originalSampleText,
            node,
            column: null,
        });
        this.sampleTextParts.set(sampleTextParts.length ? sampleTextParts : [{ value: originalSampleText }]);
        const precedingNumMatches = sampleTextParts.filter((part) => part.match).length;
        const latinTextParts = api.findGetParts({
            value: originalLatinText,
            node,
            column: null,
            precedingNumMatches,
        });
        this.latinTextParts.set(latinTextParts.length ? latinTextParts : [{ value: originalLatinText }]);
        return true;
    }
}
