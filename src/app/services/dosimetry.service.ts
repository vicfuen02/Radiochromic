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
  Dosis: number;

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

  DosisCalculus(SavedCalibration: Calibration, saveRGB: number[]) {

    // a_color = SavedCalibration.color[0]
    // b_color = SavedCalibration.color[1]
    // c_color = SavedCalibration.color[2]

    if (SavedCalibration.formula == 'Rational') {

      console.log('rational')

      let Dosis_channel = [( SavedCalibration.red[1] / (saveRGB[0] - SavedCalibration.red[0]) ) + SavedCalibration.red[2],
                          ( SavedCalibration.green[1] / (saveRGB[1] - SavedCalibration.green[0]) ) + SavedCalibration.green[2],
                          ( SavedCalibration.blue[1] / (saveRGB[2] - SavedCalibration.blue[0]) ) + SavedCalibration.blue[2]
                        ];
      this.Dosis = (Dosis_channel[0] + Dosis_channel[1] + Dosis_channel[2]) / 3;
      console.log('Dosis per channel:',Dosis_channel, 
                  'Mean Dosis:', this.Dosis)

    } else if (SavedCalibration.formula == 'Optical Density') {

      console.log('optical')
      let OD = - [Math.log10(this.saveRGB[0]), Math.log10(this.saveRGB[1]), Math.log10(this.saveRGB[2])]

      let Dosis_channel = [( SavedCalibration.red[1] - SavedCalibration.red[2]*OD[0] ) / ( OD[0] - SavedCalibration.red[0] ),
                          ( SavedCalibration.green[1] - SavedCalibration.green[2]*OD[1] ) / ( OD[1] - SavedCalibration.green[0] ),
                          ( SavedCalibration.blue[1] - SavedCalibration.blue[2]*OD[2] ) / ( OD[2] - SavedCalibration.blue[0] )
                        ];
      this.Dosis = (Dosis_channel[0] + Dosis_channel[1] + Dosis_channel[2]) / 3;
      console.log('Dosis per channel:',Dosis_channel, 
                  'Mean Dosis:', this.Dosis)



    } else if (SavedCalibration.formula == 'Net Optical Density') {
      
      console.log('net optical')

    } else {
      console.log('ninguna formula')
    }

    return this.Dosis

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



