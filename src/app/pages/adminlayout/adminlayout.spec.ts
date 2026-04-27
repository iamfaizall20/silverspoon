import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adminlayout } from './adminlayout';

describe('Adminlayout', () => {
  let component: Adminlayout;
  let fixture: ComponentFixture<Adminlayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adminlayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adminlayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
