import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import { App } from './app';

ModuleRegistry.registerModules([AllCommunityModule]);

describe('App', () => {
    let component: App;
    let fixture: ComponentFixture<App>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
        fixture = TestBed.createComponent(App);
        component = fixture.componentInstance;
    });

    it('GridApi is available', async () => {
        // Detect changes triggers the AgGridAngular lifecycle hooks
        fixture.detectChanges();
        // Wait for the fixture to stabilise
        // If there are timeout loops / un-cancelled setInterval calls, this will hang and cause a test timeout
        await fixture.whenStable();
        // ViewChild now has a reference to the component
        expect(component.agGrid()?.api).toBeTruthy();
    }, 15000);
});
