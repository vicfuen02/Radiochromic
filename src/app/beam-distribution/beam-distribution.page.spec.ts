import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BeamDistributionPage } from './beam-distribution.page';

describe('BeamDistributionPage', () => {
  let component: BeamDistributionPage;
  let fixture: ComponentFixture<BeamDistributionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeamDistributionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BeamDistributionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
