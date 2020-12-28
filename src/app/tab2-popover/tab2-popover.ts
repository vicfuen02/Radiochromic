import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { PhotoService } from '../services/photo.service';

@Component({
  template: `
    <ion-list>
      <ion-item button (click)="getGallery()">
        <ion-label>Import from Gallery</ion-label>
      </ion-item>

    </ion-list>
  `
})
export class PopoverPage {
  constructor(public popoverCtrl: PopoverController) {}

//   support() {
//     // this.app.getRootNavs()[0].push('/support');
//     this.popoverCtrl.dismiss();
//   }

  close(url: string) {
    window.open(url, '_blank');
    this.popoverCtrl.dismiss();
  }

}
