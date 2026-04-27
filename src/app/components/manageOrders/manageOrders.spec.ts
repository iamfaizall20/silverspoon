import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orders } from './manageOrders';

describe('Orders', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orders]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
