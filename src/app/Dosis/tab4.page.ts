import { Component, OnInit } from '@angular/core';

import { PhotoService } from '../services/photo.service';
import { DosimetryService } from '../services/dosimetry.service'
import { Photo } from '../models/photo.interface';
import { Calibration } from '../models/calibration.interface';


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  // ExportedCalibrations: Calibration[] = [];

  calibrations: Calibration[] = [];

  SelectedCalibration: Calibration;

  PixelPoint: number[];
  RGBPoint: number[] = [];

  zero: [number[],number[], number[]] = [
    [],
    [],
    []
  ];
  ExistsZero = false;
  ZeroLength: number;

  PixelDosis: number;


  constructor(private photoSvc: PhotoService,
              private dosimetryService: DosimetryService) {          
  }

  async ngOnInit() {

    await this.dosimetryService.GetStoragedCalibration().then( () => {
      this.calibrations = this.dosimetryService.getCalibration();
    });
  }

  DeleteLastCalibration() {
    this.dosimetryService.deleteCalibration()
  }



  // LoadCalibration() {

  //   this.ExportedCalibrations.unshift(this.dosimetryService.AddSavedCalibration())
  //   console.log(this.ExportedCalibrations)
    
  // }



  SetZero() {

    this.ExistsZero= true;
    this.zero[0].push(this.dosimetryService.saveRGB[0]);
    this.zero[1].push(this.dosimetryService.saveRGB[1]);
    this.zero[2].push(this.dosimetryService.saveRGB[2]);
    this.ZeroLength = this.zero[0].length
    
    console.log('zero:',this.zero)
  }

  ClearZero() {

    this.ExistsZero = false;
    this.zero =[[],[],[]];
    this.ZeroLength = 0;
    console.log('zero:',this.zero)

  }



  CalculateDosis() {

    try {

      if (this.ExistsZero == false ) {

        console.log('no hay zero')

        this.RGBPoint = this.dosimetryService.saveRGB;
      } else {

        console.log('hay zero')

        
        for (let i=0; i < this.zero.length; i++) {

          // console.log('zeroI:',this.zero)
          this.RGBPoint[i] = Math.abs(this.dosimetryService.saveRGB[i] - (this.zero[i].reduce((a,b) => a + b)  / this.zero[i].length) ) ;
        }
      }

      this.PixelPoint =  this.dosimetryService.saveXY;

      console.log('PixelPoint',this.PixelPoint);
      console.log('RGBPoint',this.RGBPoint);
      console.log('selected:',this.SelectedCalibration);

      this.PixelDosis = this.dosimetryService.DosisCalculus(this.SelectedCalibration,this.RGBPoint);

    } catch (e) {
      console.log(e)
    }

  }


  
}


 


