import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BeamDistributionPageRoutingModule } from './beam-distribution-routing.module';

import { BeamDistributionPage } from './beam-distribution.page';

import { ImageCropperModule } from 'ngx-image-cropper';
import { CanvasDrawComponent } from '../canvas-draw/canvas-draw.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BeamDistributionPageRoutingModule,
    ImageCropperModule,
    ChartsModule
  ],
  declarations: [BeamDistributionPage, CanvasDrawComponent]
})
export class BeamDistributionPageModule {}
