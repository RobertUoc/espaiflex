import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarDiaModalComponent } from './mostrar-dia-modal.component';

describe('MostrarDiaModalComponent', () => {
  let component: MostrarDiaModalComponent;
  let fixture: ComponentFixture<MostrarDiaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostrarDiaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostrarDiaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
