import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AgChartsAngular} from './ag-charts-angular.component';
import { AgChartOptions } from 'ag-charts-community';
import {Component} from "@angular/core";

const DATA_UK_LABOUR_MARKET_FEB_2020 = [
    { type: 'Managers, directors & senior officials', earnings: 954 },
    { type: 'Professional occupations', earnings: 844 },
    { type: 'Associate professional & technical', earnings: 699 },
    { type: 'Skilled trades', earnings: 503 },
    { type: 'Process, plant & machine operatives', earnings: 501 },
    { type: 'Administrative & secretarial', earnings: 457 },
    { type: 'Sales & customer services', earnings: 407 },
    { type: 'Elementary occupations', earnings: 380 },
    { type: 'Caring, leisure & other services', earnings: 358 },
];

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
            <ag-charts-angular [options]="options"></ag-charts-angular>`
    })
    class TestHostComponent {
        options: AgChartOptions = {
            autoSize: true,
            data: DATA_UK_LABOUR_MARKET_FEB_2020,
            title: {
                text: 'Gross Weekly Earnings by Occupation (Q4 2019)',
                fontSize: 18,
            },
            subtitle: {
                text: 'Source: Office for National Statistics',
            },
            series: [
                {
                    type: 'bar',
                    xKey: 'type',
                    yKey: 'earnings',
                },
            ],
            axes: [
                {
                    type: 'category',
                    position: 'left',
                },
                {
                    type: 'number',
                    position: 'bottom',
                    title: {
                        enabled: true,
                        text: '£/week',
                    },
                },
            ],
            legend: {
                enabled: false,
            },
        };
    }
});
