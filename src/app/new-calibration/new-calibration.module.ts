import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewCalibrationPageRoutingModule } from './new-calibration-routing.module';

import { NewCalibrationPage } from './new-calibration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewCalibrationPageRoutingModule
  ],
  declarations: [NewCalibrationPage]
})
export class NewCalibrationPageModule {}
