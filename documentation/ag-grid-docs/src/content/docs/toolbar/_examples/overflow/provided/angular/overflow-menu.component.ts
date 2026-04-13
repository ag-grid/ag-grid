import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, viewChild } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item overflow-menu-wrapper" style="position: relative">
            <button
                #menuButton
                class="ag-toolbar-button"
                title="More actions"
                aria-label="More actions"
                aria-haspopup="true"
                [attr.aria-expanded]="isOpen"
                (click)="toggleMenu()"
                (keydown)="handleButtonKeyDown($event)"
            >
                ☰
            </button>
            <div
                #menu
                class="overflow-menu"
                role="menu"
                [style.display]="isOpen ? 'block' : 'none'"
                style="position:absolute;top:100%;right:0;z-index:10;min-width:180px;padding:4px 0;background:var(--ag-background-color,#fff);border:1px solid var(--ag-border-color,#ccc);border-radius:var(--ag-border-radius,4px);box-shadow:0 2px 8px rgba(0,0,0,.15)"
                (keydown)="handleMenuKeyDown($event)"
            >
                @for (item of actions; track item.label) {
                    <div
                        class="overflow-menu-item"
                        role="menuitem"
                        style="padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:var(--ag-font-size,13px);color:var(--ag-text-color,#333)"
                        (mouseenter)="$event.target.style.backgroundColor = 'var(--ag-row-hover-color, #f0f0f0)'"
                        (mouseleave)="$event.target.style.backgroundColor = ''"
                        (click)="item.action(); closeMenu()"
                    >
                        {{ item.label }}
                    </div>
                }
            </div>
        </div>
    `,
})
export class OverflowMenu implements IToolbarItemAngularComp {
    private cdr = inject(ChangeDetectorRef);
    private outsideClickListener: any;
    private menuButton = viewChild<ElementRef>('menuButton');
    private menu = viewChild<ElementRef>('menu');
    isOpen = false;
    actions: { label: string; action: () => void }[] = [];

    agInit(params: IToolbarItemParams): void {
        this.actions = [
            { label: 'Column Chooser', action: () => params.api.showColumnChooser() },
            { label: 'Auto Size Columns', action: () => params.api.autoSizeAllColumns() },
            {
                label: 'Toggle Columns Panel',
                action: () => {
                    if (params.api.getOpenedToolPanel() === 'columns') {
                        params.api.closeToolPanel();
                    } else {
                        params.api.openToolPanel('columns');
                    }
                },
            },
            {
                label: 'Toggle Filters Panel',
                action: () => {
                    if (params.api.getOpenedToolPanel() === 'filters-new') {
                        params.api.closeToolPanel();
                    } else {
                        params.api.openToolPanel('filters-new');
                    }
                },
            },
            { label: 'Export CSV', action: () => params.api.exportDataAsCsv() },
            { label: 'Export Excel', action: () => params.api.exportDataAsExcel() },
            { label: 'Reset Columns', action: () => params.api.resetColumnState() },
        ];

        this.outsideClickListener = (e: MouseEvent) => {
            if (this.isOpen && !(e.target as HTMLElement).closest('.overflow-menu-wrapper')) {
                this.closeMenu();
            }
        };
        document.addEventListener('click', this.outsideClickListener);
    }

    private getVisibleItems(): HTMLElement[] {
        const menuEl = this.menu()?.nativeElement;
        if (!menuEl) return [];
        return Array.from(menuEl.querySelectorAll<HTMLElement>('.overflow-menu-item')).filter(
            (el) => getComputedStyle(el).display !== 'none'
        );
    }

    handleButtonKeyDown(e: KeyboardEvent): void {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openMenu();
        }
    }

    handleMenuKeyDown(e: KeyboardEvent): void {
        const items = this.getVisibleItems();
        const currentIndex = items.indexOf(e.target as HTMLElement);

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                items[next].focus();
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                items[prev].focus();
                break;
            }
            case 'Home': {
                e.preventDefault();
                items[0]?.focus();
                break;
            }
            case 'End': {
                e.preventDefault();
                items[items.length - 1]?.focus();
                break;
            }
            case 'Escape': {
                e.preventDefault();
                this.closeMenu();
                this.menuButton()?.nativeElement.focus();
                break;
            }
            case 'Enter':
            case ' ': {
                e.preventDefault();
                (e.target as HTMLElement).click();
                break;
            }
        }
    }

    toggleMenu(): void {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu(): void {
        this.isOpen = true;
        this.cdr.markForCheck();
        requestAnimationFrame(() => {
            const items = this.getVisibleItems();
            items[0]?.focus();
        });
    }

    closeMenu(): void {
        this.isOpen = false;
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this.outsideClickListener);
    }
}
