import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderDashboardComponent } from './rider-dashboard.component';

describe('RiderDashboardComponent', () => {
  let component: RiderDashboardComponent;
  let fixture: ComponentFixture<RiderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiderDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
