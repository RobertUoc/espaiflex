/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EdificisComponent } from './edificis.component';

describe('EdificisComponent', () => {
  let component: EdificisComponent;
  let fixture: ComponentFixture<EdificisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdificisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdificisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
