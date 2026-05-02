import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Myorders } from './myorders';

describe('Myorders', () => {
  let component: Myorders;
  let fixture: ComponentFixture<Myorders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Myorders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Myorders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
