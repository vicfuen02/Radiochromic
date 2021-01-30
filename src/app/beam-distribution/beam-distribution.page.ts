import { Component } from '@angular/core';

@Component({
  selector: 'app-beam-distribution',
  templateUrl: './beam-distribution.page.html',
  styleUrls: ['./beam-distribution.page.scss'],
})
export class BeamDistributionPage {

  constructor() {}

  CropImage = false

  croppedImage() {

    if (!this.CropImage) {
      this.CropImage = true;
    } else {
      this.CropImage = false
    }
  }



}
