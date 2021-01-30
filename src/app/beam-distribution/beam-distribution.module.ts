import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BeamDistributionPageRoutingModule } from './beam-distribution-routing.module';

import { BeamDistributionPage } from './beam-distribution.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BeamDistributionPageRoutingModule
  ],
  declarations: [BeamDistributionPage]
})
export class BeamDistributionPageModule {}
