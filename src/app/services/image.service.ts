import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class ImageService {

    private platform: Platform;

    constructor(platform: Platform) {
        this.platform = platform;
      }

      public async loadImage() {
        await console.log('message from image.service')
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



