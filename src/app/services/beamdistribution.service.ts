import { Injectable } from '@angular/core';
import { CropperPosition } from 'ngx-image-cropper';

@Injectable({
  providedIn: 'root'
})
export class BeamDistributionService {

  resizeX: number;
  resizeY: number;

  constructor() { }

  ResizedPixels(imagePosition: CropperPosition) {

    let newPixel1 = [Math.trunc(imagePosition.x1 / this.resizeX), Math.trunc(imagePosition.y1 / this.resizeY)];
    let newPixel2 = [Math.trunc(imagePosition.x2 / this.resizeX), Math.trunc(imagePosition.y2 / this.resizeY)];
    console.log('NEW PIXELS:', newPixel1, newPixel2);
    return [newPixel1, newPixel2]
  }

  sum(array:number[]) {
    let suma: number = 0
    for (let i = 0; i < array.length; i++) {
      suma = suma + array[i]
    }
    return suma
  }

  PowElementsArray(array:number[], power:number) {

    let arrayPowered: number[] = [];
    for (let index = 0; index < array.length; index++) {
      arrayPowered[index] = Math.pow(array[index], power);
    }
    return arrayPowered
  }

  SubsElementArray(element:number, array:number[]) {

    let arraySubstract: number[] = [];
    for (let index = 0; index < array.length; index++) {
      arraySubstract[index] = array[index] - element;
    }
    return arraySubstract
  }

  ProductElementsArray(array1:number[], array2:number[]) {

    let arrayProduct: number[] = [];
    if (array1.length == array2.length) {
      
      for (let index = 0; index < array1.length; index++) {
        arrayProduct[index] = array1[index]*array2[index];
      }
    } else {
      console.log('array1 and arra2 must have same length')
    }
    return arrayProduct
  }

  linspace(startValue: number, stopValue: number, cardinality: number, roundDecimal?: number) {

    var arr: number[] = [];
    var step: number = (stopValue - startValue) / (cardinality - 1);
    if (roundDecimal) {
      for (var i = 0; i < cardinality; i++) {
        +arr.push(startValue + (step * i)).toFixed(roundDecimal);
      }
    } else {
      for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
      }
    }
    
    return arr;
  }

  GaussianFunction(x: number[], A: number, w: number, mu: number, y0: number, roundDecimal?: number) {

    // gaussian = y_offset + ( a / (w * sqrt(pi/2)) ) * exp( -2 * ( x_Gaussian-mu)**2/(w**2) )
    // w = 2*sigma
    // A: Area
    let gaussian: number[] = [];
    if (roundDecimal) {
      for (let i = 0; i < x.length; i++) {
        gaussian[i] = +(y0 + ( A / (w * Math.sqrt(Math.PI/2)) ) * Math.exp( -2 * (( x[i] - mu)**2)/(w**2) )).toFixed(roundDecimal);
      }
    } else {
      for (let i = 0; i < x.length; i++) {
        gaussian[i] = y0 + ( A / (w * Math.sqrt(Math.PI/2)) ) * Math.exp( -2 * (( x[i] - mu)**2)/(w**2) );
      }
    }
    
    return gaussian
  }


    
  GaussianFitting(x0: number[], y0: number[]) {
    console.log('------------ AJUSTE GAUSSIANO ------------------');

    console.log('y0: ', y0);
    for (let i = 0; i < y0.length; i++) {
      console.log('y0[i]:', y0[i]);
      if (isNaN(y0[i])) {
        console.log('in splice');
        y0.splice(i,1);
        x0.splice(i,1);
        console.log('y0: ', y0);
      }   
    }
    console.log('y0: ', y0);
    
    let y_offset: number = Math.min(...y0)*0.99;
    let y_no_offset: number[] = this.SubsElementArray(y_offset, y0);
    let y_max: number= Math.max(...y0);
    console.log('x0: ', x0);
    // console.log('y0: ', y0);
    console.log('y_offset: ', y_offset);
    console.log('y_no_offset: ', y_no_offset);
    console.log('y_max: ', y_max);
    // let y_max: number= Math.max(...y_no_offset);
    let x: number[] = [];
    let y: number[] = [];
    // let threshold: number = y_max*0.1;
    let threshold: number = (y_max - y_offset)*0.2 + y_offset;
    console.log('threshold: ', threshold);
    for (let i = 0; i < y0.length; i++) {

      if (y0[i] > threshold) {
        y.push(y_no_offset[i]);
        x.push(x0[i]);
      }
    }

    console.log('x: ', x);
    console.log('y: ', y);

    // y_Quadratic = A + Bx + Cx^2;

    let y_Quadratic: number[] = [];
    for (let i = 0; i < y.length; i++) {
      y_Quadratic[i] = Math.log(y[i]);
    }

    let n: number = x.length;
    let x2: number[] = this.PowElementsArray(x,2);
    let mean_x: number = this.sum(x)/n;
    let mean_y: number = this.sum(y_Quadratic)/n;
    let mean_x2: number = this.sum(x2)/n;


    // let Sxx = this.sumatorio((x - mean_x)**2)
    // let Sxy = this.sumatorio((x-mean_x)*(y_Quadratic-mean_y))
    // let Sxx2 = this.sumatorio((x-mean_x)*(x**2-mean_x2))
    // let Sx2x2 = this.sumatorio((x**2-mean_x2)**2)
    // let Sx2y = this.sumatorio((x**2-mean_x2)*(y_Quadratic-mean_y))

    let Sxx: number = this.sum( this.PowElementsArray(this.SubsElementArray(mean_x, x), 2) );
    let Sxy: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_y, y_Quadratic)) );
    let Sxx2: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_x2, x2)) );
    let Sx2x2: number = this.sum( this.PowElementsArray(this.SubsElementArray(mean_x2, x2), 2) );
    let Sx2y: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x2, x2), this.SubsElementArray(mean_y, y_Quadratic)));

    let B: number = ( Sxy*Sx2x2 - Sx2y*Sxx2 )/( Sxx*Sx2x2 - Sxx2**2 );
    let C: number = ( Sx2y*Sxx - Sxy*Sxx2 )/( Sxx*Sx2x2 - Sxx2**2 );
    let A: number = mean_y - B*mean_x - C*mean_x2;
    // let r = np.sqrt( 1 - ( this.sumatorio(y_Quadratic - (A+B*x+C*x**2))**2 ) / ( this.sumatorio((y_Quadratic - mean_y)**2) ) )
    

    console.log('x_Gaussian:', x0[0], x0[x0.length-1]);
    console.log('y_Quadratic: ', y_Quadratic);
    console.log('n: ', n);
    console.log('mean_x: ', mean_x);
    console.log('mean_y: ', mean_y);
    console.log('mean_x2: ', mean_x2);
    console.log('Sxx: ', Sxx);
    console.log('Sxy: ', Sxy);
    console.log('Sxx2: ', Sxx2);
    console.log('Sx2x2: ', Sx2x2);
    console.log('Sx2y: ', Sx2y);
    console.log('B: ', B);
    console.log('C: ', C);
    console.log('A: ', A);


    // let sigma: number = +(0.5*(Math.sqrt(-2/C))).toFixed(3);
    // let w2: number = +(-2/C).toFixed(3);
    // let w: number = +(Math.sqrt(-2/C)).toFixed(3);
    // let mu : number= +(B*w2 / 4).toFixed(3);
    // let a: number = +(Math.exp( A + (2*mu**2)/w2 + Math.log( w*Math.sqrt(Math.PI/2) ) )).toFixed(3);
    // let FWHM: number = +(Math.sqrt(2*Math.log(2))*w2).toFixed(3);
    // let yc: number = +(y_offset + a / (w * Math.sqrt(Math.PI/2))).toFixed(3);

    let sigma: number = +(0.5*(Math.sqrt(-2/C)));
    let w2: number = -2/C;
    let w: number = Math.sqrt(-2/C);
    let mu : number= B*w2 / 4;
    let a: number = Math.exp( A + (2*mu**2)/w2 + Math.log( w*Math.sqrt(Math.PI/2) ) );
    let FWHM: number = Math.sqrt(2*Math.log(2))*w2;
    let yc: number = y_offset + a / (w * Math.sqrt(Math.PI/2));

    let x_Gaussian: number[] = this.linspace(x0[0], x0[x0.length-1], 100, 3);
    let gaussian: number[] = this.GaussianFunction(x_Gaussian, a, w, mu, y_offset, 3);

    sigma = +sigma.toFixed(3);
    a = +a.toFixed(3);
    yc = +yc.toFixed(3);
    w = +w.toFixed(3);
    mu = +mu.toFixed(3);
    FWHM = +FWHM.toFixed(3);
    
    console.log('A:', a);
    console.log('w (w = 2*sigma):', w);
    console.log('mu:', mu);
    console.log('sigma:', sigma);
    console.log('FWHM:', FWHM);

    console.log('------------ FIN AJUSTE GAUSSIANO ------------------');
    return [x_Gaussian, gaussian, [yc, sigma, mu, a, FWHM]]
  }



  



}