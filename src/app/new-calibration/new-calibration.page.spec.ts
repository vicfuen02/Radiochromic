import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewCalibrationPage } from './new-calibration.page';

describe('NewCalibrationPage', () => {
  let component: NewCalibrationPage;
  let fixture: ComponentFixture<NewCalibrationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCalibrationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewCalibrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
