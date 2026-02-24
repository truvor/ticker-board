import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickerBoard } from './ticker-board-component';

describe('TickerBoard', () => {
  let component: TickerBoard;
  let fixture: ComponentFixture<TickerBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TickerBoard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TickerBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
