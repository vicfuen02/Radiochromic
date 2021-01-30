import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },  {
    path: 'new-calibration',
    loadChildren: () => import('./new-calibration/new-calibration.module').then( m => m.NewCalibrationPageModule)
  },
  {
    path: 'beam-distribution',
    loadChildren: () => import('./beam-distribution/beam-distribution.module').then( m => m.BeamDistributionPageModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
