import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';

import type { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
    standalone: true,
    template: `
        <input
            #input
            class="phone-cell-editor"
            type="text"
            [value]="value"
            [attr.pattern]="pattern"
            placeholder="(123) 456-7890"
            (input)="onInput($event)"
            (blur)="validatePhone()"
        />
    `,
    styles: [
        `
            .phone-cell-editor {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 1px solid transparent;
            }

            .phone-cell-editor:focus {
                outline: none;
            }

            .phone-cell-editor:focus:not(:invalid) {
                border-color: blue;
            }
        `,
    ],
})
export class PhoneEditor implements ICellEditorAngularComp, AfterViewInit {
    @ViewChild('input', { static: true }) inputRef!: ElementRef<HTMLInputElement>;

    public value: string = '';
    public pattern = '^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$';

    private validationError: string | null = null;
    private params: any;

    agInit(params: any): void {
        this.params = params;
        this.value = params.value || '';
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.inputRef.nativeElement.focus();
            this.inputRef.nativeElement.select();
        });
    }

    getValue(): string {
        return this.value;
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.validatePhone();
    }

    validatePhone(): void {
        const trimmed = this.value.trim();
        const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

        if (!phoneRegex.test(trimmed)) {
            this.validationError = 'Invalid phone format. Use (123) 456-7890';
        } else {
            this.validationError = null;
        }

        this.params.validate?.();
    }

    getValidationErrors(): string[] | null {
        return this.validationError ? [this.validationError] : null;
    }

    getValidationElement(): HTMLElement {
        return this.inputRef.nativeElement;
    }

    isCancelAfterEnd(): boolean {
        return false;
    }
}
