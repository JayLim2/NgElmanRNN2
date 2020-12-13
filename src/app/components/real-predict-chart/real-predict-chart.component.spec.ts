import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealPredictChartComponent } from './real-predict-chart.component';

describe('RealPredictChartComponent', () => {
  let component: RealPredictChartComponent;
  let fixture: ComponentFixture<RealPredictChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealPredictChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealPredictChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
