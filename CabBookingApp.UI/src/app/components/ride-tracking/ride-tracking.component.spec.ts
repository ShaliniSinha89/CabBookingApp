import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideTrackingComponent } from './ride-tracking.component';

describe('RideTrackingComponent', () => {
  let component: RideTrackingComponent;
  let fixture: ComponentFixture<RideTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RideTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
