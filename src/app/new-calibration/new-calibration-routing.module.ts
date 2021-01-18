import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewCalibrationPage } from './new-calibration.page';

const routes: Routes = [
  {
    path: '',
    component: NewCalibrationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewCalibrationPageRoutingModule {}
