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
