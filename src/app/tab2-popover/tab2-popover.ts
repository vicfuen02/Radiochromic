import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { PhotoService } from '../services/photo.service';

@Component({
  template: `
    <ion-list>
      <ion-item button (click)="photoSvc.TakePhotoFromGallery()">
        <ion-label>Import from Gallery</ion-label>
      </ion-item>

    </ion-list>
  `
})
export class PopoverPage {
  constructor(public popoverCtrl: PopoverController,
              private photoSvc: PhotoService) {}

}
