import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class DosimetryService {

  private platform: Platform;
  Dosis: number;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  // public async loadImage(photo, position) {
  //   await console.log('message from image.service')
  //   await console.log(`photo : ${photo.filepath}, position : ${position}`)
  // }

  LineLength(point0: [number, number], point1: [number, number]) {

    let len = Math.sqrt( (point1[0] - point0[0]) ** 2 + (point1[1] - point0[1]) **2 );
    // console.log(len)
    return len
  }

  CoordinateSistem(origin, axisX, axisY) {

    let distanceX = this.LineLength(origin,axisX); //px
    let distanceY = this.LineLength(origin,axisY); //px
    console.log(distanceX, distanceY)
    return [origin, distanceX, distanceY]
  }

  Distances(origin, distanceX, distanceY, data1: [number,number], data2: [number,number]) {

    let cmX= 1; //cm
    let cmY = 2; //cm

    let r1 = Math.sqrt( ( (data1[0] - origin[0]) * (cmX/distanceX) ) **2 + ( (data1[1] - origin[1]) * (cmY/distanceY) ) **2 );
    let r2 = Math.sqrt( ( (data2[0] - origin[0]) * (cmX/distanceX) ) **2 + ( (data2[1] - origin[1]) * (cmY/distanceY) ) **2 );
    console.log('r1:',r1,'r2:',r2)
    let r = Math.abs(r2-r1);
    console.log('r:',r)
    return r
  }


  RacionalCalibracion(PV) {

    const ar = -0.006;
    const br = 1.4562;
    const cr = -2.4830;

    const ag = -0.0555;
    const bg = 2.2749;
    const cg = -3.8405;

    const ab = 0.0062;
    const bb = 1.2622;
    const cb = -7.9521;

    let Dr = cr + br / (PV - ar);
    let Dg = cg + bg / (PV - ag);
    let Db = cb + bb / (PV - ab);

    this.Dosis = (Dr + Db + Dg) / 3

    console.log(this.Dosis)
    return this.Dosis


  }








}



// import * as sharp from 'sharp';

// import { Image } from 'image-js';
// // import * as Image from 'image-js'


//       public async loadImage(photo, position) {
//         await console.log('message from image.service')

//         await console.log(`photo : ${photo.filepath}, position : ${position}`)

//         // await sharp('atomo.png')
//         //             .extractChannel('green')
//         //             .toColourspace('b-w')
//         //             .toFile('green.jpg');

//         // Image.load('atomo.png').then((image) => {
//         //     console.log('Width',image.width);
//         //     console.log('Height', image.height);
//         //     console.log('colorModel', image.colorModel);
//         //     console.log('components', image.components);
//         //     console.log('alpha', image.alpha);
//         //     console.log('channels', image.channels);
//         //     console.log('bitDepth', image.bitDepth);
//         //     });

//       }



