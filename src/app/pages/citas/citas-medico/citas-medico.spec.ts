import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasMedico } from './citas-medico';

describe('CitasMedico', () => {
  let component: CitasMedico;
  let fixture: ComponentFixture<CitasMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
