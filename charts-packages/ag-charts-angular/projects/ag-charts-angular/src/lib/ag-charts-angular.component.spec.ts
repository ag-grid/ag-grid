import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AgChartsAngular} from './ag-charts-angular.component';
import {Component} from "@angular/core";

describe('AgChartsAngularComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AgChartsAngular, TestHostComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    @Component({
        selector: `host-component`,
        template: `
            <ag-charts-angular options="options"></ag-charts-angular>`
    })
    class TestHostComponent {
        options = {}
    }
});
