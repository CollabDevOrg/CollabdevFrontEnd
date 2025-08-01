import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageVisiteurComponent } from './page-visiteur.component';

describe('PageVisiteurComponent', () => {
  let component: PageVisiteurComponent;
  let fixture: ComponentFixture<PageVisiteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageVisiteurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageVisiteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
