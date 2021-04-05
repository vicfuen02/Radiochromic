import { Component, OnInit, ViewChild } from '@angular/core';

import { PhotoService } from '../services/photo.service';
import { DosimetryService } from '../services/dosimetry.service'
import { RGBAvaluesService } from '../services/rgbavalues.service';
import { BeamDistributionService } from '../services/beamdistribution.service';

import { ImageCroppedEvent, ImageTransform, ImageCropperComponent, CropperPosition } from 'ngx-image-cropper';
import { Calibration } from '../models/calibration.interface';
import { CanvasDrawComponent } from '../canvas-draw/canvas-draw.component';
import * as Chart from "chart.js";
// import { ChartDataSets } from 'chart.js';
// import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-beam-distribution',
  templateUrl: './beam-distribution.page.html',
  styleUrls: ['./beam-distribution.page.scss'],
})
export class BeamDistributionPage implements OnInit {

  @ViewChild("CanvasComponent") CanvasComponent: CanvasDrawComponent;
  // @ViewChild('myChart', { static: false }) chart: any;
  CropImage = false;
  CalculatingDistance = false;

  calibrations: Calibration[] = []; // Calibraciones guardas en "Dosimetry"
  SelectedCalibration: Calibration; // Calibracion seleccionada"

  //// Parametros de calculo de distancias
  coords0: number[]; // origin
  coordsX: number[]; // eje X
  coordsY: number[]; // eje Y
  coordsData: number[]=[];
  RGBAData: number[];
  distance: number;

  ///// Parametros del zero
  zero: [number[],number[], number[]] = [
    [],
    [],
    []
  ];
  ExistsZero = false;
  ZeroLength: number = 0;
  /////// Dosis
  RGBPoint: number[] = [];
  PixelDoseChannel: number[];
  RGB_MeanDose: number;
  RG_MeanDose: number;

  ///// Porcion de la imagen seleccionada
  myImage=null; // Imagen a escanear
  croppedImage = null; // porcion de la imagen que estoy seleccionando
  selectedImage; // Datos de la porcion selecionada

  /////// Plot
  // PlotDataRGB;
  // PlotDataRG;
  ExistsChart = false;
  private Chart: Chart;
  FWHM_Y:number;
  sigma_Y:number;
  mu_Y:number;
  yc_Y:number;
  A_Y:number;
  y0_Y: number;
  FWHM_X:number;
  sigma_X:number;
  mu_X:number;
  yc_X:number;
  A_X:number;
  y0_X: number;
  // scale = 1;
  // transform: ImageTransform = {};
  // @ViewChild(ImageCropperComponent, {static: false}) angularCropper: ImageCropperComponent;

  constructor(private photoSvc: PhotoService,
              private dosimetryService: DosimetryService,
              private rgbavaluesService: RGBAvaluesService,
              private beamDistributionService: BeamDistributionService,
  ) {}

  async ngOnInit() {

    // await this.dosimetryService.GetStoragedCalibration().then( () => {
    //   this.calibrations = this.dosimetryService.getCalibration();
    // });
  }


  ionViewDidEnter() {

    this.dosimetryService.GetStoragedCalibration().then( () => {
      this.calibrations = this.dosimetryService.getCalibration();
    });

    this.captureImage()

    if (!this.CropImage) {
      this.CanvasComponent.setBackground();
      console.log('false');
    }
  }

  DisplayIf(ev) {

    if (!this.CalculatingDistance) {
      this.CalculatingDistance = true;
      this.CropImage = false;
      this.ExistsChart = false;
    } else {
      this.CalculatingDistance = false;
      this.CropImage = true;
      this.ExistsChart = false;
    }
  }

  ////////////////////// ZERO ////////////////////////////

  // Establece el cero
  SetZero() {

    this.ExistsZero= true;
    this.zero[0].push(this.dosimetryService.saveRGB[0]);
    this.zero[1].push(this.dosimetryService.saveRGB[1]);
    this.zero[2].push(this.dosimetryService.saveRGB[2]);
    this.ZeroLength = this.zero[0].length;
    console.log('Set Zero:',this.zero);
  }
  
  // Limpia el cero
  ClearZero() {

    this.ExistsZero = false;
    this.zero =[[],[],[]];
    this.ZeroLength = 0;
    // console.log('Clear Zero:',this.zero)
  }


  ////////////////////// DISTANCIAS ////////////////////////////
  SetOrigincoord() {
    let pixel = this.dosimetryService.saveXY;
    this.coords0 = [pixel[0], pixel[1]];
  }

  SetXcoord() {
    let pixel = this.dosimetryService.saveXY;
    this.coordsX = [pixel[0], pixel[1]];
  }

  SetYcoord() {
    let pixel = this.dosimetryService.saveXY;
    this.coordsY = [pixel[0], pixel[1]];
  }

  SetDatacoord() {
    let pixel = this.dosimetryService.saveXY;
    this.coordsData.push(pixel[0], pixel[1]);
    this.RGBAData = this.dosimetryService.saveRGB;
    console.log(this.coordsData);
  }

  ClearDatacoord() {
    this.coordsData = [];
    console.log(this.coordsData);
  }

  DistanceCalculus(data1: [number,number], data2: [number,number]) {
    //Distancia entre dos puntos
    let CoordSist = this.dosimetryService.CoordinateSistem(this.coords0,this.coordsX,this.coordsY);
    this.distance = +this.dosimetryService.Distances(CoordSist[1], CoordSist[2], data1, data2).toFixed(2);
    return this.distance;
  }

  // DistanceCalculus() {
  //   //Distancia entre dos puntos
  //   let CoordSist = this.dosimetryService.CoordinateSistem(this.coords0,this.coordsX,this.coordsY);
  //   this.distance = +this.dosimetryService.Distances(CoordSist[1],CoordSist[2],[this.coordsData[0],this.coordsData[1]],[this.coordsData[2],this.coordsData[3]]).toFixed(2);
  // }


  ////////////////////// CROP IMAGE ////////////////////////////
  async captureImage() {

    try {

      let photoShared = await this.photoSvc.getSharedPhoto();
      this.myImage = photoShared.webviewPath;

    } catch (e) {
      console.log('no image selected');
    }
  }

  async imageCropped(ev: ImageCroppedEvent) {
    this.croppedImage = await ev.base64;
    console.log('Image Crop:', ev);

    this.selectedImage = ev;
    // this.beamDistributionService.ResizedPixels(this.selectedImage.imagePosition)
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  Distribution() {

    let Dataset_X: Chart.ChartDataSets[] = [];
    let Dataset_Y: Chart.ChartDataSets[] = [];
    let [PlotDataY, PlotDataX] = this.SetUpDataDistribution(this.selectedImage, this.SelectedCalibration);
    
    ////////////// Vertical Plot (Y Width)
    console.log('VERTICAL ORIGINAL PLOT');
    let PlotDataRGB_Y = this.PrepareDataForPlot(PlotDataY[0], PlotDataY[1]);
    let PlotDataRG_Y = this.PrepareDataForPlot(PlotDataY[0], PlotDataY[2]);
    let Gaussian_Y_PrePlot = this.beamDistributionService.GaussianFitting(PlotDataY[0], PlotDataY[1]);
    let Gaussian_Y = this.PrepareDataForPlot(Gaussian_Y_PrePlot[0], Gaussian_Y_PrePlot[1]);
    // console.log('Gaussian_Y:', Gaussian_Y_PrePlot);
    Dataset_Y = [{
      label: 'Dose (Gy) vs Distance (mm)',
      data: PlotDataRGB_Y,
      fill:  true,
      backgroundColor: 'rgba(31, 119, 180, 1)',
    }, {
      label: 'Dose (Gy) vs Distance (mm) Gaussian Fitting',
      data: Gaussian_Y,
      fill:  true,
      backgroundColor: 'rgba(255, 127, 14, 1)',
    }];
    this.FWHM_Y = Gaussian_Y_PrePlot[2][4];
    this.sigma_Y = Gaussian_Y_PrePlot[2][1];
    this.mu_Y = Gaussian_Y_PrePlot[2][2];
    this.yc_Y = Gaussian_Y_PrePlot[2][0];
    this.A_Y = Gaussian_Y_PrePlot[2][3];
    this.y0_Y = Gaussian_Y_PrePlot[2][5];

    ////////////// Horizontal Plot (X Width)
    console.log('HORIZONTAL ORIGINAL PLOT');
    let PlotDataRGB_X = this.PrepareDataForPlot(PlotDataX[0], PlotDataX[1]);
    let PlotDataRG_X = this.PrepareDataForPlot(PlotDataX[0], PlotDataX[2]);
    let Gaussian_X_PrePlot = this.beamDistributionService.GaussianFitting(PlotDataX[0], PlotDataX[1]);
    let Gaussian_X = this.PrepareDataForPlot(Gaussian_X_PrePlot[0], Gaussian_X_PrePlot[1]);
    // console.log('Gaussian_X:', Gaussian_X);
    Dataset_X = [{
      label: 'Dose (Gy) vs Distance (mm)',
      data: PlotDataRGB_X,
      fill:  true,
      backgroundColor: 'rgba(31, 119, 180, 1)',
    }, {
      label: 'Dose (Gy) vs Distance (mm) Gaussian Fitting',
      data: Gaussian_X,
      fill:  true,
      backgroundColor: 'rgba(255, 127, 14, 1)',
    }];
    this.FWHM_X = Gaussian_X_PrePlot[2][4];
    this.sigma_X = Gaussian_X_PrePlot[2][1];
    this.mu_X = Gaussian_X_PrePlot[2][2];
    this.yc_X = Gaussian_X_PrePlot[2][0];
    this.A_X = Gaussian_X_PrePlot[2][3];
    this.y0_X = Gaussian_Y_PrePlot[2][5];
    
    console.log('PLOT');
    // console.log('this.ExistsChart:', this.ExistsChart);
    // this.DestroyPlot(this.Chart);
    // this.DestroyPlot(this.Chart);
    // console.log('this.ExistsChart:', this.ExistsChart);

    console.log('PLOT 1');
    this.Plot(this.Chart,'chart_1', Dataset_Y);
    // console.log('this.ExistsChart:', this.ExistsChart);
    // console.log(' typeof this.Chart[0]:', typeof this.Chart);
    // console.log('this.Chart[0]:',this.Chart);
    
    console.log('PLOT 2');
    this.Plot(this.Chart,'chart_2', Dataset_X);
    // console.log('this.ExistsChart:', this.ExistsChart);
    // console.log(' typeof this.Chart[0]:', typeof this.Chart);
    // console.log('this.Chart[0]:',this.Chart);
    // this.Plot('chart_1', PlotDataRGB_Y, 'rgba(31, 119, 180, 1)');
    // this.Plot('chart_2', PlotDataRGB_X, 'rgba(255, 127, 14, 1)');
    // this.Plot('chart_2', Gaussian_Y, 'rgba(255, 127, 14, 1)');
    
  }

  SetUpDataDistribution(croppedPixels: ImageCroppedEvent, calibration: Calibration) {

    // Esquina superir izquierda y esquina inferior derecha de la seleccion, [[x1,y1], [x2,y2]]
    let points = this.beamDistributionService.ResizedPixels(croppedPixels.imagePosition);
    let Square_Width = Math.abs(points[0][0] - points[1][0]);
    let Square_Height = Math.abs(points[0][1] - points[1][1]);
    let imgData = this.rgbavaluesService.imageData;
    // console.log('Square_Width:', Square_Width);
    // console.log('Square_Height:', Square_Height);
    // console.log('imgData BEAM:', imgData);


    // let PlotDataY = this.BeamWidht('vertical', imgData, calibration, points, Square_Width, Square_Height);
    // this.Plot('chart_1', PlotDataY[0], 'rgba(31, 119, 180, 1)');
    // let PlotDataX = this.BeamWidht('horizontal', imgData, calibration, points, Square_Width, Square_Height);
    // this.Plot('chart_2', PlotDataX[0], 'rgba(255, 127, 14, 1)');


    console.log('VERTICAL');
    let PlotDataY = this.BeamWidht('vertical', imgData, calibration, points, Square_Width, Square_Height);
    // let PlotDataRGB_Y = this.PrepareDataForPlot(PlotDataY[0], PlotDataY[1]);
    // let PlotDataRG_Y = this.PrepareDataForPlot(PlotDataY[0], PlotDataY[2]);
    // this.Plot('chart_1', PlotDataRGB_Y, 'rgba(31, 119, 180, 1)');

    console.log('HORIZONTAL');
    let PlotDataX = this.BeamWidht('horizontal', imgData, calibration, points, Square_Width, Square_Height);
    // let PlotDataRGB_X = this.PrepareDataForPlot(PlotDataX[0], PlotDataX[1]);
    // let PlotDataRG_X = this.PrepareDataForPlot(PlotDataX[0], PlotDataX[2]);
    // this.Plot('chart_2', PlotDataRGB_X, 'rgba(255, 127, 14, 1)');
    return [PlotDataY, PlotDataX]
  }

  BeamWidht(orientation = 'vertial' || 'horizontal', imgData, calibration: Calibration, points: number[][], Square_Width, Square_Height) {

    let dataX: number[];
    let dataY:number [][][];
    if (orientation == 'vertical') {

      dataX = this.DataForFittingX([ points[0][0] + Math.trunc(Square_Width/2), points[0][1] ], [ points[0][0] + Math.trunc(Square_Width/2), points[1][1] ], Square_Height);
      dataY = this.rgbavaluesService.circlePixelsNearby(imgData, points[0][0], points[0][1], Square_Width, Square_Height, 'vertical');
    } else {

      dataX = this.DataForFittingX([ points[0][0], points[0][1] + Math.trunc(Square_Height/2) ], [ points[1][0], points[0][1] + Math.trunc(Square_Height/2)  ], Square_Width);
      dataY = this.rgbavaluesService.circlePixelsNearby(imgData, points[0][1], points[0][0], Square_Height, Square_Width,'horizontal');
    }
   
    let [DoseY_RGB, DoseY_RG] = this.DataForFittingY(dataY, calibration);
    // console.log('dataX:', dataX);
    // console.log('DoseY_RGB:', DoseY_RGB);
    // console.log('DoseY_RG:', DoseY_RG);
    return [dataX, DoseY_RGB, DoseY_RG]
    // let PlotDataRGB = this.PrepareDataForPlot(dataX, DoseY_RGB);
    // let PlotDataRG = this.PrepareDataForPlot(dataX, DoseY_RG);
    // return [PlotDataRGB, PlotDataRG]
    
  }



  // VerticalBeamWidht(imgData, calibration: Calibration, points: number[][], Square_Width, Square_Height) {

  //   let dataX = this.DataForFittingX([ points[0][0] + Math.trunc(Square_Width/2), points[0][1] ], [ points[0][0] + Math.trunc(Square_Width/2), points[1][1] ], Square_Height);
  //   let dataY = this.rgbavaluesService.circlePixelsNearby(imgData, points[0][0], points[0][1], Square_Width, Square_Height, 'vertical');
  //   let [DoseY_RGB, DoseY_RG] = this.DataForFittingY(dataY, calibration);
  //   let PlotDataRGB = this.PrepareDataForPlot(dataX, DoseY_RGB);
  //   let PlotDataRG = this.PrepareDataForPlot(dataX, DoseY_RG);
  //   return [PlotDataRGB, PlotDataRG]
  // }

  // HorizontalBeamWidht(imgData, calibration: Calibration, points: number[][], Square_Width, Square_Height) {

  //   let dataX = this.DataForFittingX([ points[0][0], points[0][1] + Math.trunc(Square_Height/2) ], [ points[1][0], points[0][1] + Math.trunc(Square_Height/2)  ], Square_Width);
  //   let dataY = this.rgbavaluesService.circlePixelsNearby(imgData, points[0][1], points[0][0], Square_Height, Square_Width,'horizontal');
  //   let [DoseY_RGB, DoseY_RG] = this.DataForFittingY(dataY, calibration);
  //   let PlotDataRGB = this.PrepareDataForPlot(dataX, DoseY_RGB);
  //   let PlotDataRG = this.PrepareDataForPlot(dataX, DoseY_RG);
  //   return [PlotDataRGB, PlotDataRG]
  // }

  

  DataForFittingX(data1: [number,number], data2: [number,number], distanceInPixels) {

    let DistanceHeight = this.DistanceCalculus(data1, data2);
    let stepY = DistanceHeight / distanceInPixels;  // distance per pixel
    let FittingX: number[] = [];
    for (let d = 0; d < distanceInPixels; d++) {
      FittingX.push(+(stepY + d*stepY).toFixed(2))
    }
    // console.log('FittingX:', FittingX);
    // console.log('FittingX.length:', FittingX.length);
    console.log('END DataForFittingX')
    return FittingX
  }

  DataForFittingY(dataY, calibration: Calibration) {
    // Calculate the dose for the rgb values from dataY
    
    let dataY_R: number[][] = dataY[0];
    let dataY_G: number[][] = dataY[1];
    let dataY_B: number[][] = dataY[2];
    let DoseY_RGB: number[] = [];
    let DoseY_RG: number[] = [];
    let circleDoseRGB: number[][] = [];
    let circleDoseRG: number[][] = [];

    for (let i=0; i < dataY_R.length; i++) {
      circleDoseRGB[i] = [];
      circleDoseRG[i] = [];
    }
    console.log('dataforfittingY');
    for (let line = 0; line < dataY_R.length; line++) {
      for (let pixel = 0; pixel < dataY_R[line].length; pixel++) {

        let RGB_MeanDose: number;
        let RG_MeanDose: number;
        let PixelDoseChannel: number[] = [];
        let rgb: number[] = [dataY_R[line][pixel], dataY_G[line][pixel], dataY_B[line][pixel]];
        [PixelDoseChannel, [RGB_MeanDose, RG_MeanDose] ] = this.dosimetryService.CalculateDose(this.ExistsZero, rgb, calibration, this.zero);
        
        circleDoseRGB[line].push(RGB_MeanDose);
        circleDoseRG[line].push(RG_MeanDose);
      }

      // console.log('dataY_R[line]:', dataY_R[line]);
      // DoseY_RGB.push( this.dosimetryService.ArrayMean(circleDoseRGB[line]) );
      // DoseY_RG.push( this.dosimetryService.ArrayMean(circleDoseRG[line]) );
      DoseY_RGB.push( Math.max(...circleDoseRGB[line]) );
      DoseY_RG.push( Math.max(...circleDoseRG[line]) );
      
    }
    DoseY_RGB = this.beamDistributionService.RoundArray(DoseY_RGB, 3);
    DoseY_RG = this.beamDistributionService.RoundArray(DoseY_RG, 3);
    console.log('END DataForFittingY');
    return [DoseY_RGB, DoseY_RG]
  }

  // DataFittingY(dataY, calibration: Calibration) {
  //   // Calculate the dose for the rgb values from dataY
    
  //   let dataY_R: number[][] = dataY[0];
  //   let dataY_G: number[][] = dataY[1];
  //   let dataY_B: number[][] = dataY[2];
  //   // console.log('dataY_R:', dataY_R);
  //   // console.log('PixelsNearby_G:', PixelsNearby_G);
  //   // console.log('PixelsNearby_B:', PixelsNearby_B);

  //   let DoseY_RGB: number[] = [];
  //   let DoseY_RG: number[] = [];
  //   let circleDoseRGB: number[][] = [];
  //   let circleDoseRG: number[][] = [];
  //   // console.log('a:',1);
  //   for (let i=0; i < dataY_R.length; i++) {
  //     circleDoseRGB[i] = [];
  //     circleDoseRG[i] = [];
  //   }
  //   // console.log('INIT DataForFittingY LOOP');
  //   for (let line = 0; line < dataY_R.length; line++) {
  //     for (let pixel = 0; pixel < dataY_R[line].length; pixel++) {

  //       let rgb: number[] = [dataY_R[line][pixel], dataY_G[line][pixel], dataY_B[line][pixel]];
  //       let array: number[] = this.dosimetryService.DosisPerChannel(calibration, rgb);
  //       let pixelChannelDose: number[] = this.dosimetryService.RoundArray(array, 3);
  //       // console.log('line:',line,'pixel:',pixel);
  //       // console.log('pixelChannelDose:',pixelChannelDose);
  //       let pixelDose: number[] = this.dosimetryService.TotalDoses(pixelChannelDose);
  //       circleDoseRGB[line].push(pixelDose[0]);
  //       circleDoseRG[line].push(pixelDose[1]);
  //     }

  //     // console.log('dataY_R[line]:', dataY_R[line]);
  //     DoseY_RGB.push( +this.dosimetryService.ArrayMean(circleDoseRGB[line]).toFixed(3) );
  //     DoseY_RG.push( +this.dosimetryService.ArrayMean(circleDoseRG[line]).toFixed(3) );
  //   }

  //   // console.log('circleDoseRGB:',circleDoseRGB);
  //   // console.log('DoseY_RGB:', DoseY_RGB);
  //   // console.log('DoseY_RG:', DoseY_RG);
  //   // console.log('DoseY_RGB:', DoseY_RGB);
  //   // console.log('DoseY_RGB.length:', DoseY_RGB.length);
  //   console.log('END DataForFittingY');
    
  //   return [DoseY_RGB, DoseY_RG]
  // }

  PrepareDataForPlot(X_Axis: number[], Y_Axis: number[]) {

    let DataPlot = []
    for (let i = 0; i < X_Axis.length; i++) {
      DataPlot[i] = {
        x: X_Axis[i],
        y: Y_Axis[i]
      }
    }
    return DataPlot
  }

  DestroyPlot(chart: Chart) {

    console.log('this.ExistsChart:', this.ExistsChart);
    console.log('chart:',chart);
    if (this.ExistsChart == true) {
      console.log('typeof chart:',typeof chart);
      console.log('chart:',chart);
      chart.destroy();
      // this.InvestmentChart = null;
      console.log('typeof chart:',typeof chart);
      console.log('chart:',chart);
      this.ExistsChart = false;
    }
  }

  // resetCanvas(){
  //   ('chart-1').remove(); // this is my <canvas> element
  //   $('#graph-container').append('<canvas id="results-graph"><canvas>');
  //   canvas = document.querySelector('#results-graph');
  //   ctx = canvas.getContext('2d');
  //   ctx.canvas.width = $('#graph').width(); // resize to parent width
  //   ctx.canvas.height = $('#graph').height(); // resize to parent height
  //   var x = canvas.width/2;
  //   var y = canvas.height/2;
  //   ctx.font = '10pt Verdana';
  //   ctx.textAlign = 'center';
  //   ctx.fillText('This text is centered on the canvas', x, y);
  // };

  Plot(chartTarget: Chart, context: string, DataSet) {

    // console.log('1111111111111',typeof this.InvestmentChart);
    // if (typeof this.InvestmentChart == 'object') {
    //   console.log('1111111111111',typeof this.InvestmentChart);
    //   this.InvestmentChart.destroy()
    //   console.log('1111111111111',typeof this.InvestmentChart);
    // }
    // console.log('1111111111111',typeof this.InvestmentChart);
    // const ctx = document.getElementById('investment-charts');
    // const ctx = $('#myChart');
    this.ExistsChart = true;
    const ctx = context;
    chartTarget = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: DataSet,
      },
      options: {
        scales: {
          yAxes: [{
            display: true,
            // stacked: true,
            labels: ['Doses (Gy)'],
            type: 'linear',
            position: 'bottom'
          }],
          xAxes: [{
            display: true,
            type: 'linear',
            position: 'bottom',
            // stacked: true,
            labels: ['Distance (cm)']
          }]
        }
      }
    });    
  }

  



  ////////////////////////////// ZOOM IMAGE ////////////////////////////
  // resetImage() {
  //   this.scale = 1;
  //   this.transform = {};
  // }

  // zoomOut() {
  //     this.scale -= .1;
  //     this.transform = {
  //         ...this.transform,
  //         scale: this.scale
  //     };
  // }

  // zoomIn() {
  //     this.scale += .1;
  //     this.transform = {
  //         ...this.transform,
  //         scale: this.scale
  //     };
  // }


}
