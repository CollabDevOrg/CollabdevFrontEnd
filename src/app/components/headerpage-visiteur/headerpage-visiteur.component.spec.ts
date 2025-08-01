import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderpageVisiteurComponent } from './headerpage-visiteur.component';

describe('HeaderpageVisiteurComponent', () => {
  let component: HeaderpageVisiteurComponent;
  let fixture: ComponentFixture<HeaderpageVisiteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderpageVisiteurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderpageVisiteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
