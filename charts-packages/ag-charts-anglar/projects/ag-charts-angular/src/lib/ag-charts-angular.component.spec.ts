import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgChartsAngularComponent } from './ag-charts-angular.component';

describe('AgChartsAngularComponent', () => {
  let component: AgChartsAngularComponent;
  let fixture: ComponentFixture<AgChartsAngularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgChartsAngularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgChartsAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
