import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
    imports: [AgGridAngular],
    template: '',
})
class TooltipInteractionTest {
    public interaction = () => false;
    public grid = viewChild(AgGridAngular);
}

describe('tooltipInteraction input', () => {
    it.each([
        ['tooltipInteraction', true],
        ['tooltipInteraction="false"', false],
        ['[tooltipInteraction]="false"', false],
        ['[tooltipInteraction]="interaction"', 'callback'],
    ])('preserves %s', async (attribute, expected) => {
        await TestBed.configureTestingModule({ imports: [TooltipInteractionTest] })
            .overrideComponent(TooltipInteractionTest, {
                set: { template: `<ag-grid-angular ${attribute} [columnDefs]="[]" [rowData]="[]" />` },
            })
            .compileComponents();
        const fixture = TestBed.createComponent(TooltipInteractionTest);
        fixture.detectChanges();
        await fixture.whenStable();

        const component = fixture.componentInstance;
        expect(component.grid()!.api.getGridOption('tooltipInteraction')).toBe(
            expected === 'callback' ? component.interaction : expected
        );
        fixture.destroy();
    });
});
