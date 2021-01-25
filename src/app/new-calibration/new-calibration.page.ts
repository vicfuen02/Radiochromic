import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Calibration } from '../models/calibration.interface';
import { DosimetryService } from '../services/dosimetry.service';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Component({
  selector: 'app-new-calibration',
  templateUrl: './new-calibration.page.html',
  styleUrls: ['./new-calibration.page.scss'],
})
export class NewCalibrationPage {

  FilmType: string[] = [
    'EBT2',
    'EBT3',
    'EBT3unl'
  ];

  CalibrationFormula = {
    formula: ['Rational', 'Optical Density','Net Optical Density'],
    expresion: ['','PV(D) = b / (D-c) + a',
                  'OD(D) = (a*D + b) / (c + D); OD = - log10( PV )',
                  'netOD(D) = a*D + b*D^c; netOD = log10( PV0/PV )']
  
  };

  newCalibration: Calibration = {
    name: '',
    type: '',
    formula: '',

    red_param: [],  // [a,b,c]
    green_param: [],  // [a,b,c]
    blue_param: []  // [a,b,c]
  }

  // displayexprs='';

    
  constructor(private router: Router,
    private dosimetryService: DosimetryService) { }

  
  // if (this.newCalibration.formula = '') {
  //   // displayExpr = this.CalibrationFormula.expresion[0]
  //   this.displayExpr = newCalibration.formula
  // } else {

  // }

  // displayExpr = ''
  
  // if (this.displayexprs == '') {

  //   let expr = this.CalibrationFormula.formula.indexOf(this.displayexprs)

  // }
  
  

  async SaveNewCalibration() {

    // this.newCalibration.formula = this.displayexprs
    await this.dosimetryService.StorageNewCalibration(this.newCalibration);
    await console.log(this.newCalibration)
    this.router.navigate(['/tabs/tab4']);

  }

  // async SaveNewCalibration() {

  //   this.dosimetryService.SavedCalibration = await this.newCalibration;
  //   await console.log(this.newCalibration)
  //   this.router.navigate(['/tabs/tab4']);

  // }


  

  

}
