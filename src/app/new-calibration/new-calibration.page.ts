import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Calibration } from '../models/calibration.interface';
import { DosimetryService } from '../services/dosimetry.service';

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
    expresion: ['PV(D) = a + b / (D-c)', 'OD(D) = (a*D + b) / (c + D)', 'netOD(D) = a*D + b*D^c']
  
  };

  

  newCalibration: Calibration = {
    name: '',
    type: '',
    formula: '',

    red: [],  // [a,b,c]
    green: [],  // [a,b,c]
    blue: []  // [a,b,c]
  }

    
  constructor(private router: Router,
    private dosimetryService: DosimetryService) { }

  
  // if (newCalibration.formula != '') {
  //   // displayExpr = this.CalibrationFormula.expresion[0]
  //   this.displayExpr = newCalibration.formula
  // }


  // displayExpr = ''
  

  // expr = this.CalibrationFormula.formula.indexOf(this.displayExpr)
  

  async SaveNewCalibration() {

    this.dosimetryService.SavedCalibration = await this.newCalibration;
    await console.log(this.newCalibration)

    this.router.navigate(['/tabs/tab4']);

  }

  

}
