import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Calibration } from '../models/calibration.interface';
import { Pixel } from '../models/pixel.interface';
import { Plugins } from '@capacitor/core';
import { BeamDistributionService } from '../services/beamdistribution.service';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class DosimetryService {

  private platform: Platform;
  Dose_channel: number[];
  RGB_MeanDose: number;
  RG_MeanDose: number;
  err_RGB_MeanDose: number;
  // SavedCalibration: Calibration;
  saveXY: number[];
  saveRGB: number[];

  private calibration: Calibration[] = [];
  private CALIBRATION_STORAGE = 'calibrations';

  constructor(platform: Platform,
              private beamDistributionService: BeamDistributionService) {
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


  CalculateDose(ExistsZero: boolean, RGBPoint: number[], SelectedCalibration: Calibration, zero?: [number[], number[], number[]]) {

    //  Calcular la dosis de cada punto del zero con la racional y luego la media de todas las dosis

    try {

      let PixelDoseChannel: number[] = [];

      if (ExistsZero == false ) {

        // console.log('no hay zero');
        /////////// Dosis del pixel seleccionado
        PixelDoseChannel = this.DosisPerChannel(SelectedCalibration,RGBPoint);

      } else {

        // console.log('hay zero');

        /////////// Dosis del zero
        // let ZeroDose: number[] = [];
        let ZeroDosePerChannel_R: number[] = [];
        let ZeroDosePerChannel_G: number[] = [];
        let ZeroDosePerChannel_B : number[] = [];
        let TotalZeroDose: number[] = [];
        let TotalZero_RGBvalue: number[] = [];

        // Dosis de cada pixel del zero
        // se añade al vector ZeroDose para calcular la media de todos los valores
        if (SelectedCalibration.formula == 'Rational') {

          for (let pixel = 0; pixel < zero[0].length; pixel++) {

            ZeroDosePerChannel_R[pixel] = this.RationalEquation(zero[0][pixel], SelectedCalibration.red_param);
            ZeroDosePerChannel_G[pixel] = this.RationalEquation(zero[1][pixel], SelectedCalibration.green_param);
            ZeroDosePerChannel_B[pixel] = this.RationalEquation(zero[2][pixel], SelectedCalibration.blue_param);
          }
          // Zero mean dose for the values R, G and B
          TotalZeroDose = [ this.ArrayMean(ZeroDosePerChannel_R), 
                            this.ArrayMean(ZeroDosePerChannel_G), 
                            this.ArrayMean(ZeroDosePerChannel_B)
          ];
          TotalZero_RGBvalue = [this.RationalEquation_RGBvalue(TotalZeroDose[0], SelectedCalibration.red_param), 
                                this.RationalEquation_RGBvalue(TotalZeroDose[1], SelectedCalibration.green_param), 
                                this.RationalEquation_RGBvalue(TotalZeroDose[2], SelectedCalibration.blue_param)
          ];

        } else if (SelectedCalibration.formula == 'Optical Density') {

          for (let pixel = 0; pixel < zero[0].length; pixel++) {

            ZeroDosePerChannel_R[pixel] = this.OpticalEquation(zero[0][pixel], SelectedCalibration.red_param);
            ZeroDosePerChannel_G[pixel] = this.OpticalEquation(zero[1][pixel], SelectedCalibration.green_param);
            ZeroDosePerChannel_B[pixel] = this.OpticalEquation(zero[2][pixel], SelectedCalibration.blue_param);
          }
          // Zero mean dose for the values R, G and B
          TotalZeroDose = [ this.ArrayMean(ZeroDosePerChannel_R), 
                            this.ArrayMean(ZeroDosePerChannel_G), 
                            this.ArrayMean(ZeroDosePerChannel_B)
          ];
          TotalZero_RGBvalue = [this.OpticalEquation_RGBvalue(TotalZeroDose[0], SelectedCalibration.red_param), 
                                this.OpticalEquation_RGBvalue(TotalZeroDose[1], SelectedCalibration.green_param), 
                                this.OpticalEquation_RGBvalue(TotalZeroDose[2], SelectedCalibration.blue_param)
          ];

        } else if (SelectedCalibration.formula == 'Net Optical Density') {

          TotalZero_RGBvalue = [this.ArrayMean(zero[0]),
                                this.ArrayMean(zero[1]),
                                this.ArrayMean(zero[2])
          ];
          // console.log('TotalZero_RGBvalue:', TotalZero_RGBvalue);
        }

        
        /////////// Dosis del pixel seleccionado
        let DoseChannel: number[] = this.DosisPerChannel(SelectedCalibration, RGBPoint, TotalZero_RGBvalue);
        // console.log('DoseChannel:', DoseChannel);
        if (SelectedCalibration.formula == 'Rational' || SelectedCalibration.formula == 'Optical Density') {

          for (let i = 0; i < 3; i++) {

            PixelDoseChannel[i] = DoseChannel[i] - TotalZeroDose[i];
          }   
        } else {

          // console.log('DoseChannel:', DoseChannel);
          PixelDoseChannel = DoseChannel;
        }

      }

      // this.PixelPoint =  this.dosimetryService.saveXY;
      // console.log('PixelPoint',this.PixelPoint);
      // console.log('RGBPoint',this.RGBPoint);
      // console.log('selected:',this.SelectedCalibration);

      let err_PixelDoseChannel: number[] = [];
      err_PixelDoseChannel[0] = this.Error_Dose_RationalEquation(RGBPoint, SelectedCalibration.red_param, 'red');
      err_PixelDoseChannel[1] = this.Error_Dose_RationalEquation(RGBPoint, SelectedCalibration.green_param, 'green');
      err_PixelDoseChannel[2] = this.Error_Dose_RationalEquation(RGBPoint, SelectedCalibration.blue_param, 'blue');
      // console.log('errDoseChannel:', err_PixelDoseChannel);

      ////////////// Calcula la dosis total del pixel a partir de la dosis de cada canal (media RGB, media RG, minimos cuadrados, etc)
      [this.RGB_MeanDose, this.RG_MeanDose, this.err_RGB_MeanDose] = this.TotalDoses(PixelDoseChannel, err_PixelDoseChannel);
      PixelDoseChannel = this.RoundArray(PixelDoseChannel, 3);
      // console.log('errDose:', this.err_RGB_MeanDose);
      
      return [PixelDoseChannel, [this.RGB_MeanDose, this.RG_MeanDose, this.err_RGB_MeanDose]]

    } catch (e) {
      console.log(e);
    }
  }


  DosisPerChannel(SavedCalibration: Calibration, RGB: number[], zeroRGB?: number[]) {

    // RGB = [red, green, blue], RGB values 
    // zeroRGB = [red, green, blue], zero RGB values 
    // a_color = SavedCalibration.color[0]
    // b_color = SavedCalibration.color[1]
    // c_color = SavedCalibration.color[2]

    if (SavedCalibration.formula == 'Rational') {

      // console.log('Rational')

      this.Dose_channel = [ this.RationalEquation(RGB[0], SavedCalibration.red_param),
                            this.RationalEquation(RGB[1], SavedCalibration.green_param),
                            this.RationalEquation(RGB[2], SavedCalibration.blue_param)
      ];
      // console.log('Dose per channel:', this.Dose_channel);

    } else if (SavedCalibration.formula == 'Optical Density') {

      // console.log('Optical Density');

      this.Dose_channel = [ this.OpticalEquation(RGB[0], SavedCalibration.red_param),
                            this.OpticalEquation(RGB[1], SavedCalibration.green_param),
                            this.OpticalEquation(RGB[2], SavedCalibration.blue_param)
      ];
      // console.log('Dose per channel:', this.Dose_channel)

    } else if (zeroRGB && SavedCalibration.formula == 'Net Optical Density') {
      
      // console.log('Net Optical Density');

      // //////// el parametro inical del método de Newton-Raphson, x0, es la dosis calculada con la formula racional
      // let x0: number[] = [this.RationalEquation(RGB[0], SavedCalibration.red_param),
      //                     this.RationalEquation(RGB[1], SavedCalibration.green_param),
      //                     this.RationalEquation(RGB[2], SavedCalibration.blue_param)
      // ];
      // // console.log('x0 netOD:',x0);

      // let tol = 0.001; // Precision del calculo
      // this.Dose_channel = [ this.NewtonRaphsonMethod(x0[0], tol, this.NetOpticalDensity, RGB[0], zeroRGB[0], SavedCalibration.red_param),
      //                       this.NewtonRaphsonMethod(x0[1], tol, this.NetOpticalDensity, RGB[1], zeroRGB[1], SavedCalibration.green_param),
      //                       this.NewtonRaphsonMethod(x0[2], tol, this.NetOpticalDensity, RGB[2], zeroRGB[2], SavedCalibration.blue_param)
      // ];
      // // console.log('Dose per channel:', this.Dose_channel);

      // ----------------------------------
      let tol = 0.001; // Precision del calculo
      this.Dose_channel = [ this.BolzanoMethod(tol, this.NetOpticalDensity, RGB[0], zeroRGB[0], SavedCalibration.red_param),
                            this.BolzanoMethod(tol, this.NetOpticalDensity, RGB[1], zeroRGB[1], SavedCalibration.green_param),
                            this.BolzanoMethod(tol, this.NetOpticalDensity, RGB[2], zeroRGB[2], SavedCalibration.blue_param)
      ];
      
      //---------------

    } else {
      // console.log('ninguna formula o falta cero');
    }

    return this.Dose_channel
  }
  
  // Calcula la dosis total del pixel a partir de la dosis de cada canal
  TotalDoses(DosesPerChannel: number[], err_DosesPerChannel?: number[]) {

    let DR = DosesPerChannel[0];
    let DG = DosesPerChannel[1];
    let DB = DosesPerChannel[2];

    let err_DR = err_DosesPerChannel[0];
    let err_DG = err_DosesPerChannel[1];
    let err_DB = err_DosesPerChannel[2];

    let isR:number;
    let isB:number;
    if (DR<10 && DG<10) {
      isR = 1;
    } else {
      isR = 0;
    }

    if (DG>2 && DB>2) {
      isB = 1;
    } else {
      isB = 0;
    }

    
    // let doseRGB: number = (isR * DR + DG + isB * DB) / (1 + isR + isB);
    let doseRGB: number = ( isR *( DR)/( err_DR**2 ) + (DG)/(err_DG**2) + isB *(DB)/( err_DB**2) )  / ( isR * 1/(err_DR**2)  + 1/(err_DG**2 ) + isB * 1/(err_DB**2) );
    let err_doseRGB: number;
    if (err_DosesPerChannel) {

      // let err_doseRGB: number = Math.sqrt( ( (isR*err_DR)**2 + (err_DG)**2 + (isB * err_DB)**2 ) / (1 + isR + isB) );
      err_doseRGB = 1 / Math.sqrt(  isR * 1/(err_DR**2)  + 1/(err_DG**2 ) + isB * 1/(err_DB**2) );
      this.err_RGB_MeanDose = + err_doseRGB.toFixed(3);
    } else {
      this.err_RGB_MeanDose = 0;
    }
    // console.log('isRGB:', [isR, isB]);
    // console.log('DosesPerChannel:', DosesPerChannel);
    // console.log('err_DosesPerChannel:', err_DosesPerChannel);
    // console.log('errDoseChannel:', err_PixelDoseChannel);
    // console.log('doseRGB:', doseRGB);
    // console.log('err_doseRGB:', err_doseRGB);

    this.RGB_MeanDose = + doseRGB.toFixed(3);
    // this.RGB_MeanDose = +this.ArrayMean(DosesPerChannel).toFixed(3);
    this.RG_MeanDose = +this.ArrayMean(DosesPerChannel,2).toFixed(3);
    // console.log('RGB_MeanDose:', this.RGB_MeanDose,'RG_MeanDose:', this.RG_MeanDose)
    return [this.RGB_MeanDose, this.RG_MeanDose, this.err_RGB_MeanDose]
  }


  SubstracZero(totalDosePixel: number[], zero, calibration: Calibration) {

    let zeroMeanRGB: number[];
    let zeroMeanRG: number[];

    for (let i=0; i < zero.length; i++) {

      let zeroRGB: number[] = [zero[0][i], zero[1][i], zero[2][i]];
      let doseZero = this.DosisPerChannel(calibration, zeroRGB, zeroRGB);
      let dose = this.TotalDoses(doseZero);
      zeroMeanRGB.push(dose[0]);
      zeroMeanRG.push(dose[1]);
    }
    let totalDoseZero = [this.ArrayMean(zeroMeanRGB), this.ArrayMean(zeroMeanRG)];
      
    let DoseWithoutZero: number[];
    for (let i = 0; i < totalDosePixel.length; i++) {
      DoseWithoutZero[i]= totalDosePixel[i] - totalDoseZero[i];
    }

    return DoseWithoutZero
  }


  

  ////////////////////////// FUNCIONES DE CALIBRACION ///////////////////

  RationalEquation(PV: number, Parameters: number[]) {
    // Calculate the pixel dose with the rational equation
    // a = Parameters[0]
    // b = Parameters[1]
    // c = Parameters[2]
    return Parameters[2] + ( Parameters[1] / (PV - Parameters[0]) )
  }

  RationalEquation_RGBvalue(Dose: number, Parameters: number[]) {
    // Calculate the pixel R, G, or B value with the rational equation
    let a = Parameters[0];
    let b = Parameters[1];
    let c = Parameters[2];
    return a + b / (Dose - c)
  }

  Error_Dose_RationalEquation(RGBpoint: number[], Parameters: number[], channel: string = 'red' || 'green' || 'blue') {

    let a = Parameters[0];
    let b = Parameters[1];
    let c = Parameters[2];

    let dR_par: number[] = [0.0065, 0.0161, 0.0260]; // [a, b, c]
    let dG_par: number[] = [0.014, 0.0755, 0.1097]; // [a, b, c]
    let dB_par: number[] = [891.1342, 1.6826*10**6, 2.6238*10**5]; // [a, b, c]

    let PV: number;
    let err_Par: number[] = [];
    let errPV: number[] = [2.5/100, 1.5/100, 3/100];
    let dPV: number;
    if (channel == 'red') {

      PV = RGBpoint[0];
      dPV = errPV[0]*PV;
      err_Par = dR_par;
    } else if (channel == 'green') {

      PV = RGBpoint[1];
      dPV = errPV[1]*PV;
      err_Par = dG_par;
    } else {

      PV = RGBpoint[2];
      dPV = errPV[2]*PV;
      err_Par = dB_par;
    }

    let da: number = err_Par[0]; // [a, b, c]
    let db: number = err_Par[1]; // [a, b, c]
    let dc: number = err_Par[2]; // [a, b, c]

    let errD: number = Math.sqrt( dc**2 + 
                ( db/(PV - a) )**2 + 
                ( b*dPV/(PV-a**2) )**2 + 
                ( b*da/(PV-a**2) )**2
    );

    return errD
  }

  OpticalEquation(PV: number, Parameters: number[]) {
    // Calculate the pixel dose with the optical equation
    // a = Parameters[0]
    // b = Parameters[1]
    // c = Parameters[2]
    let OD = -Math.log10(PV);
    return ( Parameters[1] - Parameters[2]*OD ) / (OD - Parameters[0])
  }

  OpticalEquation_RGBvalue(Dose: number, Parameters: number[]) {
    // Calculate the pixel R, G, or B value with the optical equation
    let a = Parameters[0];
    let b = Parameters[1];
    let c = Parameters[2];
    return (a * Dose + b) / (c + Dose)
  }

  NetOpticalDensity(D:number, PV: number, PV0: number, Parameters: number[]) {
  // Calculate the pixel dose with the net optical density equation
    let a = Parameters[0];
    let b = Parameters[1];
    let c = Parameters[2];

    let netOD = Math.log10( PV0 / PV );
    let funct = (a*D) + b*Math.pow(D, c) - netOD;
    let DiffFunct = a + b*c*Math.pow(D,c-1);
    return [funct, DiffFunct]
  }

  ////////////////////// SOPORTE MATEMATICO //////////////////////

  // Calculate the mean of an array. If 'elements' is specified, it calculate the mean of the 
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
        console.log(`Can't calculate. Element (${elements}) > array length (${array.length})`);
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

  RoundArray(array: number[], decimals: number) {

    let roundArray: number[] = [] 
    for (let i = 0; i < array.length; i++) {
      roundArray[i] = +array[i].toFixed(decimals);
    }
    return roundArray;
  }

  NewtonRaphsonMethod(x0, tol, callback, PV, PV0, Parameters) {
    
    let count = 0;
    let x: number;
    // callback retorna un vector donde el primer elemento es la funcion en x0 y el segundo la derivada en x0
    let funct: number[] = callback(x0, PV, PV0, Parameters);

    while ( Math.abs(funct[0]) > tol && count < 500) {

      x = x0 - funct[0]/funct[1];
        
      if (x < 0) {
        x = 0.001;
      }

      // console.log('x:', x);
        // console.log('x:', x,'f/Df',funct[0]/funct[1])
      funct = callback(x, PV, PV0, Parameters);
      x0 = x;
      count = count +1;

      // console.log('f(x):', funct)
      // console.log('numero de iteraciones N-R:', count);
    }

    // console.log('FIN ITERACIONES N-R:', count);
    return x
  }

  BolzanoMethod(tol, callback, PV, PV0, Parameters) {

    let Dose: number[] = this.beamDistributionService.linspace(0, 100, 11);
    let y: number[] = callback(Dose[0], PV, PV0, Parameters);
    console.log('Dose:', Dose);
    console.log('y:', y);
    let count =0;
    let i: number = 0;
    let D: number;
    while (Math.abs(y[0]) > tol && count < 10) {


      y = callback(Dose[i], PV, PV0, Parameters);
      D = Dose[i];
      i=i+1;
      console.log('y:', y);
      if (y[0] >= 0 && i >= 2 && Math.abs(y[0]) > tol) {

        Dose = this.beamDistributionService.linspace(Dose[i-2], Dose[i-1], 11);
        console.log('Dose:', Dose);
        i=0;
      }
      console.log('count:', count);
      count = count+1;

    }

    if (!D) {
      D = tol;
    }
    // console.log('Dose:', D);
    return D
  }




  aPV(PV: number, Parameters: number[]) {

    let a = -Parameters[1] / (PV - Parameters[0])**2;
    return a
  }
  
  // ProductNumArray(element:number, array:number[]) {
  //   // resta un numero (element) a cada elemento de un array
  //     let arrayProd: number[] = [];
  //     for (let index = 0; index < array.length; index++) {
  //       arrayProd[index] = array[index] * element;
  //     }
  //     return arrayProd
  // }
  

  correctedDPV(PV: number, Parameters: number[], delta: number) {
    
    let correctedDPV: number = this.RationalEquation(PV, Parameters) + this.aPV(PV, Parameters) * delta ;
    return correctedDPV
  }

  getDoseMicke(RGB: number[], CoefR: number[], CoefG: number[], CoefB: number[], delta: number[] = this.beamDistributionService.linspace(-0.2, 0.2, 100), pxmax: number) {


    let dev_min = 10**30;
    let delta0 = NaN;

    // % Primero sin tener en cuenta los límites
    for (let k = 0; k < delta.length; k++) {
      let dev: number = ( this.correctedDPV(RGB[0], CoefR, delta[k]) - this.correctedDPV(RGB[1], CoefG, delta[k]) )**2 +
                ( this.correctedDPV(RGB[0], CoefR, delta[k]) - this.correctedDPV(RGB[2], CoefB, delta[k]) )**2 +
                ( this.correctedDPV(RGB[1], CoefG, delta[k]) - this.correctedDPV(RGB[2], CoefB, delta[k]) )**2;

      if (dev < dev_min) {
        // let maskMin: boolean = true;
        dev_min = dev;
        delta0 = delta[k];
      }
    }

    let realDR = this.correctedDPV(RGB[0], CoefR, delta0);
    let realDG = this.correctedDPV(RGB[1], CoefG, delta0);
    let realDB = this.correctedDPV(RGB[2], CoefB, delta0);

    // % Y luego teniéndolos en cuenta
    let isR:number;
    let isB:number;

    if (realDR<10 && realDG<10) {
      isR = 1;
    } else {
      isR = 0;
    }

    if (realDG<2 && realDB<2) {
      isB = 1;
    } else {
      isB = 0;
    }

    for (let k = 0; k < delta.length; k++) {
      let dev: number = isR * ( this.correctedDPV(RGB[0], CoefR, delta[k]) - this.correctedDPV(RGB[1], CoefG, delta[k]) )**2 +
                isR * isB *( this.correctedDPV(RGB[0], CoefR, delta[k]) - this.correctedDPV(RGB[2], CoefB, delta[k]) )**2 +
                isB * ( this.correctedDPV(RGB[1], CoefG, delta[k]) - this.correctedDPV(RGB[2], CoefB, delta[k]) )**2;

      if (dev < dev_min) {
        // let maskMin: boolean = true;
        dev_min = dev;
        delta0 = delta[k];
      }
    }

    realDR = this.correctedDPV(RGB[0], CoefR, delta0);
    realDG = this.correctedDPV(RGB[1], CoefG, delta0);
    realDB = this.correctedDPV(RGB[2], CoefB, delta0);

    let doseRGB: number = (isR * realDR + realDG + isB * realDB) / (1 + isR + isB);

    return [doseRGB, realDR, realDG, realDB]
  }

    

  
  ///////////////////// DISTANCES //////////////////////////

  LineLength(point0: [number, number], point1: [number, number]) {

    let len = Math.sqrt( (point1[0] - point0[0]) ** 2 + (point1[1] - point0[1]) **2 );
    console.log('len:',len);
    return len
  }

  xobt: number;
  yobt: number;

  CoordinateSistem(origin, axisX, axisY) {

    let mmX= 10; //mm
    let mmY = 20; //mm

    let distanceX = mmX / this.LineLength(origin,axisX); // mm/px
    let distanceY = mmY / this.LineLength(origin,axisY); // mm/px
    console.log('distanceX, distanceY:', distanceX, distanceY);

    // this.xobt = this.Distances(distanceX, distanceY, origin, axisX);
    // this.yobt = this.Distances(distanceX, distanceY, origin, axisY);

    return [origin, distanceX, distanceY]
  }

  Distances(distanceX, distanceY, data1: [number,number], data2: [number,number]) {

    let r = Math.sqrt( ( (data1[0] - data2[0]) * distanceX ) **2 + ( (data1[1] - data2[1]) * distanceY ) **2 );
    // let x2 = data1[0];
    // let x1 = data2[0];
    // let y2 = data1[1];
    // let y1 = data2[1];

    // let error_distanceX = 1;
    // let error_distanceY = 1;
    // let dr = Math.sqrt( (error_distanceX*(x2 - x1)**2 / (2*r))**2 + (error_distanceY*(y2 - y1)**2 / (2*r))**2 );

    console.log('r:',r);
    // console.log('dr:',dr);
    return r
  }

  ErrorDistances(distanceX, distanceY, data1: [number,number], data2: [number,number]) {

    let r = Math.sqrt( ( (data1[0] - data2[0]) * distanceX ) **2 + ( (data1[1] - data2[1]) * distanceY ) **2 );
    let x2 = data1[0];
    let x1 = data2[0];
    let y2 = data1[1];
    let y1 = data2[1];


    // let error_drealX = 0.5;
    // let error_drealY = 0.5;
    // let drealX = 10;
    // let drealY = 20;
    // let error_xobt = 0.4496;
    // let error_yobt = 0.9599;
    // let error_xobt = 2.8407;
    // let error_yobt = 3.0209;
    // let xobt = Math.abs(x2-x1);
    // let yobt = Math.abs(y2-y1);
    // let error_distanceX  = Math.sqrt(( error_drealX/xobt) **2 + (-drealX * error_xobt / xobt**2 )**2);
    // let error_distanceY = Math.sqrt(( error_drealY/yobt )**2 + (-drealY * error_yobt / yobt**2 )**2);

    // let error_distanceX  = 0.0118;
    // let error_distanceY = 0.0062;
    let error_distanceX  = 0.0092;
    let error_distanceY = 0.0092;


    let dr = Math.sqrt( (error_distanceX * distanceX*(x2 - x1)**2 / (r))**2 + (error_distanceY * distanceY*(y2 - y1)**2 / (r))**2 );
    // console.log('r:',r);
    console.log('dr:',dr);
    return dr

  }

}





