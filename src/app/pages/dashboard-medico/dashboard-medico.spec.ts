import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMedico } from './dashboard-medico';

describe('DashboardMedico', () => {
  let component: DashboardMedico;
  let fixture: ComponentFixture<DashboardMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
