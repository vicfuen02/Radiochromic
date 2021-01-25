import { Component, OnInit } from '@angular/core';

import { DosimetryService } from '../services/dosimetry.service'
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
  ZeroLength: number = 0;

  PixelDoseChannel: number[];
  RGB_MeanDose: number;
  RG_MeanDose: number;


  constructor(private dosimetryService: DosimetryService) {          
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


  // Establece el cero
  SetZero() {

    this.ExistsZero= true;
    this.zero[0].push(this.dosimetryService.saveRGB[0]);
    this.zero[1].push(this.dosimetryService.saveRGB[1]);
    this.zero[2].push(this.dosimetryService.saveRGB[2]);
    this.ZeroLength = this.zero[0].length
    console.log('Set Zero:',this.zero)
  }
  // Limpia el cero
  ClearZero() {

    this.ExistsZero = false;
    this.zero =[[],[],[]];
    this.ZeroLength = 0;
    // console.log('Clear Zero:',this.zero)
  }


  /////////// Calcula la dosis del pixel
  CalculateDosis() {

    try {

      this.RGBPoint = this.dosimetryService.saveRGB;

      if (this.ExistsZero == false ) {

        console.log('no hay zero')

        /////////// Dosis del pixel seleccionado
        let DoseChannel = this.dosimetryService.DosisPerChannel(this.SelectedCalibration,this.RGBPoint);

        // Redondea a 3 decimales la dosis de cada canal
        let round: number[] = [] 
        for (let i = 0; i < DoseChannel.length; i++) {
          round[i] = +DoseChannel[i].toFixed(3);
        }
        /////////////// Dosis de cada canal
        this.PixelDoseChannel = round;

      } else {

        console.log('hay zero') 

        /////////// Media de los valores RGB del zero, [red, green, blue]
        let MeanZero: number[]=[]; 
        // i=0 --> red; i=1 --> green; i=2 --> blue;
        for (let i=0; i < this.zero.length; i++) {
          MeanZero[i] = (this.zero[i].reduce((a,b) => a+b) / this.zero[i].length);
        }
        console.log('MeanZero:', MeanZero)

        /////////// Dosis del pixel seleccionado
        let DoseChannel = this.dosimetryService.DosisPerChannel(this.SelectedCalibration, this.RGBPoint, MeanZero);

        //////////// Dosis del zero
        let ZeroDose: number[]=[]; 
        ZeroDose = this.dosimetryService.DosisPerChannel(this.SelectedCalibration, MeanZero, MeanZero);

        ///////////// Resta la dosis del zero a la dosis del punto seleccionado
        let substract: number[]=[];
        for (let i=0; i< ZeroDose.length; i++) {

          substract[i] = +(DoseChannel[i] - ZeroDose[i]).toFixed(3);
          console.log('DoseChannel',DoseChannel[i])
          console.log('ZeroDose',ZeroDose[i])
          console.log('PixelDoseChannel',substract[i])
        }

        /////////////// Dosis de cada canal
        this.PixelDoseChannel = substract;

      }

      // this.PixelPoint =  this.dosimetryService.saveXY;
      // console.log('PixelPoint',this.PixelPoint);
      // console.log('RGBPoint',this.RGBPoint);
      // console.log('selected:',this.SelectedCalibration);

      ////////////// Calcula la dosis total del pixel a partir de la dosis de cada canal (media RGB, media RG, minimos cuadrados, etc)
      [this.RGB_MeanDose, this.RG_MeanDose] = this.dosimetryService.TotalDoses(this.PixelDoseChannel);


    } catch (e) {
      console.log(e)
    }
  }


  // CalculateDosis() {

  //   try {

  //     if (this.ExistsZero == false ) {

  //       console.log('no hay zero')

  //       this.RGBPoint = this.dosimetryService.saveRGB;
  //     } else {

  //       console.log('hay zero')

  //       // i=0 --> red; i=1 --> green; i=2 --> blue;
  //       for (let i=0; i < this.zero.length; i++) {

  //         // console.log('zeroI:',this.zero)
  //         this.RGBPoint[i] = Math.abs(this.dosimetryService.saveRGB[i] - (this.zero[i].reduce((a,b) => a+b) / this.zero[i].length) ) ;
  //       }
  //     }

  //     this.PixelPoint =  this.dosimetryService.saveXY;
  //     console.log('PixelPoint',this.PixelPoint);
  //     console.log('RGBPoint',this.RGBPoint);
  //     console.log('selected:',this.SelectedCalibration);

      
  //     this.PixelDoseChannel = this.dosimetryService.DosisPerChannel(this.SelectedCalibration,this.RGBPoint);
  //     [this.RGB_MeanDose, this.RG_MeanDose] = this.dosimetryService.TotalDoses(this.PixelDoseChannel);

  //   } catch (e) {
  //     console.log(e)
  //   }

  // }


  
}


 


