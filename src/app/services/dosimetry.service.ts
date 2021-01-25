import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Calibration } from '../models/calibration.interface';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class DosimetryService {

  private platform: Platform;
  Dose_channel: number[];
  RGB_MeanDose: number;
  RG_MeanDose: number;
  
  // SavedCalibration: Calibration;
  saveXY: number[];
  saveRGB: number[];

  private calibration: Calibration[] = [];
  private CALIBRATION_STORAGE = 'calibrations';

  constructor(platform: Platform) {
    this.platform = platform;
  }

  ////////////////////// CALIBRATIONS ///////////////////////

  // AddSavedCalibration() {
  //   return this.SavedCalibration
  // }


  getCalibration() {
    return this.calibration
  }

  StorageNewCalibration(calibration: Calibration) {

    this.calibration.unshift(calibration);
    Storage.set({
      key: this.CALIBRATION_STORAGE,
      value: JSON.stringify(this.calibration.map(c => {
        const calibrationCopy = {...c};
        return calibrationCopy;
      }))
    });
  }


  async GetStoragedCalibration() {

    const calibrationList = await Storage.get({ key: this.CALIBRATION_STORAGE });
    this.calibration = JSON.parse(calibrationList.value) || [];
    console.log(this.calibration)
  }


  async deleteCalibration() {
    // Remove this calibration from the calibration reference data array
    this.calibration.splice(0, 1);
  
    // Update calibrations array cache by overwriting the existing calibrations array
    Storage.set({
      key: this.CALIBRATION_STORAGE,
      value: JSON.stringify(this.calibration)
    });
  
  }


  
  //////////////////// DOSIS CALCULUS ////////////////////////

  DosisPerChannel(SavedCalibration: Calibration, RGB: number[], zeroRGB?: number[]) {

    // a_color = SavedCalibration.color[0]
    // b_color = SavedCalibration.color[1]
    // c_color = SavedCalibration.color[2]

    if (SavedCalibration.formula == 'Rational') {

      console.log('Rational')

      this.Dose_channel = [ this.RationalEquation(RGB[0], SavedCalibration.red_param),
                            this.RationalEquation(RGB[1], SavedCalibration.green_param),
                            this.RationalEquation(RGB[2], SavedCalibration.blue_param)
      ];
      console.log('Dose per channel:', this.Dose_channel)

    } else if (SavedCalibration.formula == 'Optical Density') {

      console.log('Optical Density')

      this.Dose_channel = [ this.OpticalEquation(RGB[0], SavedCalibration.red_param),
                            this.OpticalEquation(RGB[1], SavedCalibration.green_param),
                            this.OpticalEquation(RGB[2], SavedCalibration.blue_param)
      ];
      console.log('Dose per channel:', this.Dose_channel)

    } else if (zeroRGB && SavedCalibration.formula == 'Net Optical Density') {
      
      console.log('Net Optical Density')

      //////// el parametro inical del método de Newton-Raphson, x0, es la dosis calculada con la formula racional
      let x0: number[] = [this.RationalEquation(RGB[0], SavedCalibration.red_param),
                          this.RationalEquation(RGB[1], SavedCalibration.green_param),
                          this.RationalEquation(RGB[2], SavedCalibration.blue_param)
      ];
      console.log('x0 netOD:',x0)

      let tol = 0.0001; // Precision del calculo
      this.Dose_channel = [ this.NewtonRaphsonMethod(x0[0], tol, this.NetOpticalDensity, RGB[0], zeroRGB[0], SavedCalibration.red_param),
                            this.NewtonRaphsonMethod(x0[1], tol, this.NetOpticalDensity, RGB[1], zeroRGB[1], SavedCalibration.green_param),
                            this.NewtonRaphsonMethod(x0[2], tol, this.NetOpticalDensity, RGB[2], zeroRGB[2], SavedCalibration.blue_param)
      ];
      console.log('Dose per channel:', this.Dose_channel)

    } else {
      console.log('ninguna formula o falta zero')
    }

    return this.Dose_channel
  }

  // Calcula la dosis total del pixel a partir de la dosis de cada canal
  TotalDoses(DosesPerChannel: number[]) {

    this.RGB_MeanDose = +this.ArrayMean(DosesPerChannel).toFixed(3)
    this.RG_MeanDose = +this.ArrayMean(DosesPerChannel,2).toFixed(3)
    console.log('RGB_MeanDose:', this.RGB_MeanDose,'RG_MeanDose:', this.RG_MeanDose)
    return [this.RGB_MeanDose, this.RG_MeanDose]
  }

  RationalEquation(PV: number, Parameters: number[]) {
    // a = Parameters[0]
    // b = Parameters[1]
    // c = Parameters[2]
    return Parameters[2] + ( Parameters[1] / (PV - Parameters[0]) )
  }

  OpticalEquation(PV: number, Parameters: number[]) {
    // a = Parameters[0]
    // b = Parameters[1]
    // c = Parameters[2]
    let OD = -Math.log10(PV)
    return ( Parameters[1] - Parameters[2]*OD ) / (OD - Parameters[0])
  }

  NewtonRaphsonMethod(x0, tol, callback, PV, PV0, Parameters) {
    
    let count = 0;
    let x: number;
    // callback retorna un vector donde el primer elemento es la funcion en x0 y el segundo la derivada en x0
    let funct: number[] = callback(x0, PV, PV0, Parameters);

    while ( Math.abs(funct[0]) > tol && count < 500) {

      x = x0 - funct[0]/funct[1];
        
      if (x < 0) {
        x = 0.0001;
      }

      console.log('x:', x)
        // console.log('x:', x,'f/Df',funct[0]/funct[1])
      funct = callback(x, PV, PV0, Parameters);
      x0 = x;
      count = count +1

      // console.log('f(x):', funct)
      console.log('numero de iteraciones N-R:', count)
    }

    console.log('FIN ITERACIONES N-R:', count)
    return x
  }


  NetOpticalDensity(D:number, PV: number, PV0: number, Parameters: number[]) {

    let a = Parameters[0]
    let b = Parameters[1]
    let c = Parameters[2];

    let netOD = Math.log10( PV0 / PV )
    // console.log('netOD:', netOD);

    let funct = (a*D) + b*Math.pow(D, c) - netOD;
    // console.log('a*D:', a*D);
    // console.log('D:', D);
    // console.log('(c):', c);
    // console.log('D**c:', Math.pow(D,c))
    // console.log('(a*D) + b*(D**c):', (a*D) + b*(D**c));

    let DiffFunct = a + b*c*Math.pow(D,c-1);
    // console.log('funct:', funct, 'DiffFunct:', DiffFunct);

    return [funct, DiffFunct]

  }


  // Calculate the mean of an array. If you especify 'elements', it calculate the mean of the 
  // first 'elements' elements
  ArrayMean(array: number[], elements?) {

    if (elements) {
      // console.log('exist element')
      if (elements <= array.length) {

        // console.log('elements < array.length')
        let sum = 0;
        for (let i=0; i < elements; i++ ) {
          sum = sum + array[i];
        }
        return sum / elements

      } else {
        console.log(`Can't calculate. Element (${elements}) > array length (${array.length})`)
      }
    } else {

      // console.log('dont exist element, calculating the mean of the whole array')
      let sum = 0;
      for (let i=0; i < array.length; i++ ) {
        sum = sum + array[i];
      }
      return sum / array.length
    }
  }

    

    

  ///////////////////// DISTANCES //////////////////////////

  LineLength(point0: [number, number], point1: [number, number]) {

    let len = Math.sqrt( (point1[0] - point0[0]) ** 2 + (point1[1] - point0[1]) **2 );
    console.log('len:',len)
    return len
  }

  CoordinateSistem(origin, axisX, axisY) {

    let cmX= 1; //cm
    let cmY = 2; //cm

    let distanceX = cmX / this.LineLength(origin,axisX); // cm/px
    let distanceY = cmY / this.LineLength(origin,axisY); // cm/px
    console.log('distanceX, distanceY:', distanceX, distanceY)
    return [origin, distanceX, distanceY]
  }

  Distances(distanceX, distanceY, data1: [number,number], data2: [number,number]) {

    let r = Math.sqrt( ( (data1[0] - data2[0]) * distanceX ) **2 + ( (data1[1] - data2[1]) * distanceY ) **2 );

    console.log('r:',r)

    return r
  }

}



