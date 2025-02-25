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
                @for (parts of textParts(); track $index) {
                    <p>
                        @for (part of parts; track $index) {
                            @if (part.match) {
                                <mark [class]="{ 'ag-find-match': true, 'ag-find-active-match': part.activeMatch }">{{
                                    part.value
                                }}</mark>
                            } @else {
                                <ng-container>{{ part.value }}</ng-container>
                            }
                        }
                    </p>
                }
            </div>
        </div>
    `,
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    textParts = signal<FindPart[][]>([]);
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
        const paragraphs = ['Sample Text in a Paragraph', ...getLatinText()];
        const textParts: FindPart[][] = [];
        let precedingNumMatches = 0;
        for (const paragraph of paragraphs) {
            const parts = api.findGetParts({
                value: paragraph,
                node,
                column: null,
                precedingNumMatches,
            });
            textParts.push(parts);
            precedingNumMatches += parts.filter((part) => part.match).length;
        }
        this.textParts.set(textParts);
        return true;
    }
}
