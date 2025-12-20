import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaModalComponent } from './sala-modal.component';

describe('SalaModalComponent', () => {
  let component: SalaModalComponent;
  let fixture: ComponentFixture<SalaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
