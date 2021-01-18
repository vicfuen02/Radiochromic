import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Tab4PageRoutingModule } from './tab4-routing.module';

import { Tab4Page } from './tab4.page';

import { CanvasDrawComponent } from '../canvas-draw/canvas-draw.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    Tab4PageRoutingModule,
    RouterModule.forChild([{ path: '', component: Tab4Page }]),
  ],
  declarations: [Tab4Page, CanvasDrawComponent]
})
export class Tab4PageModule {}
