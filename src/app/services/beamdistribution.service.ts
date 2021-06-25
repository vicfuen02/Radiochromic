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
    // suma los elementos de un array
    let suma: number = 0
    for (let i = 0; i < array.length; i++) {
      suma = suma + array[i]
    }
    return suma
  }

  PowElementsArray(array:number[], power:number) {
    // Eleva a la potencia indicada los elementos de un array
    let arrayPowered: number[] = [];
    for (let index = 0; index < array.length; index++) {
      arrayPowered[index] = Math.pow(array[index], power);
    }
    return arrayPowered
  }

  SumElementArray(element:number, array:number[]) {
    // resta un numero (element) a cada elemento de un array
      let arraySubstract: number[] = [];
      for (let index = 0; index < array.length; index++) {
        arraySubstract[index] = array[index] + element;
      }
      return arraySubstract
    }

  SubsElementArray(element:number, array:number[]) {
  // resta un numero (element) a cada elemento de un array
    let arraySubstract: number[] = [];
    for (let index = 0; index < array.length; index++) {
      arraySubstract[index] = array[index] - element;
    }
    return arraySubstract
  }

  SubsTwoArrays(array1:number[], array2:number[]) {
    // hace la resta de dos arrays
    // array1 = [a, b, c]; array2 = [d, e, f];
    // resultado = [a-d, b-e, c-f]
    let arraySub: number[] = [];
    if (array1.length == array2.length) {
      
      for (let index = 0; index < array1.length; index++) {
        arraySub[index] = array1[index] - array2[index];
      }
    } else {
      console.log('array1 and arra2 must have same length')
    }
    return arraySub
  }

  ProductElementsArray(array1:number[], array2:number[]) {
    // hace el producto de dos arrays
    // array1 = [a, b, c]; array2 = [d, e, f];
    // resultado = [a*d, b*e, c*f]
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

  ProductNumArray(element:number, array:number[]) {
    // multiplica un numero (element) a cada elemento de un array
      let arrayProd: number[] = [];
      for (let index = 0; index < array.length; index++) {
        arrayProd[index] = array[index] * element;
      }
      return arrayProd
  }

  linspace(startValue: number, stopValue: number, cardinality: number) {
    // crea un array desde startValue hasta stopValue en pasos de cardinality
    var arr: number[] = [];
    var step: number = (stopValue - startValue) / (cardinality - 1);
    
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
  }

  RoundArray(array: number[], decimals: number) {

    let roundArray: number[] = [] 
    for (let i = 0; i < array.length; i++) {
      roundArray[i] = +array[i].toFixed(decimals);
    }
    return roundArray;
  }

  GaussianFunction(x: number[], A: number, w: number, mu: number, y0: number) {

    // gaussian = y_offset + ( a / (w * sqrt(pi/2)) ) * exp( -2 * ( x_Gaussian-mu)**2/(w**2) )
    // w = 2*sigma
    // A: Area
    let gaussian: number[] = [];
    for (let i = 0; i < x.length; i++) {
      gaussian[i] = y0 + ( A / (w * Math.sqrt(Math.PI/2)) ) * Math.exp( -2 * (( x[i] - mu)**2)/(w**2) );
    }
    return gaussian
  }



  Gaussian(x0: number[], y0: number[], y_offset: number, error_y0: number[]) {
    try {
      // console.log('------------ AJUSTE GAUSSIANO ------------------');

      // console.log('x0:', x0);
      // console.log('y0:', y0);
      // console.log('y_offset:', y_offset);

      let y_no_offset: number[] = this.SubsElementArray(y_offset, y0);
      let y_max: number= Math.max(...y0);
      let x: number[] = [];
      let y: number[] = [];
      let error_y: number[] = [];
      // console.log('y_no_offset:', y_no_offset);
      let threshold: number = (y_max - y_offset)*0.2 + y_offset;
      for (let i = 0; i < y0.length; i++) {
        if (y0[i] > threshold) {
          y.push(y_no_offset[i]);
          x.push(x0[i]);
          error_y.push(error_y0[i]);
        }
      }
      // console.log('x:', x);
      // console.log('y:', y);
      
      // y_Quadratic = A + Bx + Cx^2;
      let y_Quadratic: number[] = [];
      for (let i = 0; i < y.length; i++) {
        y_Quadratic[i] = Math.log(y[i]);
      }

      // console.log('y_Quadratic:', y_Quadratic);
      let n: number = x.length;
      let x2: number[] = this.PowElementsArray(x,2);
      let mean_x: number = this.sum(x)/n;
      let mean_y: number = this.sum(y_Quadratic)/n;
      let mean_x2: number = this.sum(x2)/n;
      // Sxx = sum( (x - mean_x)**2 )
      // Sxy = sum( (x-mean_x)*(y_Quadratic-mean_y) )
      // Sxx2 = sum( (x-mean_x)*(x**2-mean_x2) )
      // Sx2x2 = sum( (x**2-mean_x2)**2 )
      // Sx2y = sum( (x**2-mean_x2)*(y_Quadratic-mean_y) )
      let Sxx: number = this.sum( this.PowElementsArray(this.SubsElementArray(mean_x, x), 2) );
      let Sxy: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_y, y_Quadratic)) );
      let Sxx2: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_x2, x2)) );
      let Sx2x2: number = this.sum( this.PowElementsArray(this.SubsElementArray(mean_x2, x2), 2) );
      let Sx2y: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x2, x2), this.SubsElementArray(mean_y, y_Quadratic)));
      let den: number = Sxx*Sx2x2 - Sxx2**2;
      let B: number = ( Sxy*Sx2x2 - Sx2y*Sxx2 )/( den );
      let C: number = ( Sx2y*Sxx - Sxy*Sxx2 )/( den );
      let A: number = mean_y - B*mean_x - C*mean_x2;
      
      // console.log('Sxx:', Sxx);
      // console.log('Sxy:', Sxy);
      // console.log('Sxx2:', Sxx2);
      // console.log('Sx2x2:', Sx2x2);
      // console.log('Sx2y:', Sx2y);
      // console.log('Sx2y:', Sx2y);
      // console.log('A:', A);
      // console.log('B:', B);
      // console.log('C:', C);

      let parcial_Sxy: number[] = [];
      let parcial_Sx2y: number[] = [];

      for (let i = 0; i < n; i++) {    

        parcial_Sxy[i] = ( ( x[i] - mean_x )*(1 - 1/n) );
        parcial_Sx2y[i] = ( ( x[i]**2 - mean_x2 )*(1 - 1/n) );
      }
      // console.log('parcial_Sxy:', parcial_Sxy);
      // console.log('parcial_Sx2y:', parcial_Sx2y);


      let parcial_B: number[] = this.SubsTwoArrays( this.ProductNumArray(Sx2x2/den, parcial_Sxy), this.ProductNumArray(Sxx2/den, parcial_Sx2y) );
      let parcial_C: number[] = this.SubsTwoArrays( this.ProductNumArray(Sxx/den, parcial_Sx2y), this.ProductNumArray(Sxx2/den, parcial_Sxy) );
      let parcial_A: number[] = this.SubsTwoArrays( this.SubsElementArray(1/n, this.ProductNumArray( mean_x, parcial_B )), this.ProductNumArray(mean_x2, parcial_C) );

      // console.log('parcial_B:', parcial_B);
      // console.log('parcial_C:', parcial_C);
      // console.log('parcial_A:', parcial_A);
      // console.log('error_y:', error_y);

      let error_B: number = Math.sqrt(this.sum( this.PowElementsArray(this.ProductElementsArray( parcial_B, error_y ), 2) )); 
      let error_C: number = Math.sqrt(this.sum( this.PowElementsArray(this.ProductElementsArray( parcial_C, error_y ), 2) )); 
      let error_A: number = Math.sqrt(this.sum( this.PowElementsArray(this.ProductElementsArray( parcial_A, error_y ), 2) ));   
      
      // console.log('error_B:', error_B);
      // console.log('error_C:', error_C);
      // console.log('error_A:', error_A);

      let sigma: number = ( Math.sqrt(-2/C)/2 );
      let w2: number = -2/C;
      let w: number = Math.sqrt(-2/C);
      let mu : number= B*w2 / 4;
      let a: number = Math.exp( A + (2*mu**2)/w2 + Math.log( w*Math.sqrt(Math.PI/2) ) );
      let FWHM: number = Math.sqrt(2*Math.log(2))*w;
      let yc: number = y_offset + a / (w * Math.sqrt(Math.PI/2));

      // console.log('A:', a);
      // console.log('w (w = 2*sigma):', w);
      // console.log('mu:', mu);
      // console.log('sigma:', sigma);
      // console.log('FWHM:', FWHM);

      let e_A: number = Math.exp( (2*mu**2)/w2 + A );
      let pi_2: number = Math.sqrt(Math.PI/2);
      let pi2: number = Math.sqrt(Math.PI*2);

      let error_sigma: number = error_C / ( 2*Math.sqrt(2) * Math.sqrt(-1/C)* C**2 );
      let error_w2: number = 8 * sigma * error_sigma;
      let error_w: number = 2* error_sigma;
      let error_mu : number = Math.sqrt( ( w2*error_B/4 )**2 + ( B*error_w2/4 )**2 );
      let error_a: number = Math.sqrt( ( pi_2*w*e_A*error_A )**2 + ( 2*pi2*mu*e_A*error_mu / w )**2 + ( (pi_2*e_A - (2*pi2*e_A*mu**2)/(w**2))*error_w )**2 );
      let error_FWHM: number = Math.sqrt(2*Math.log(2))*error_w;
      let error_yc: number = Math.sqrt( ( error_a/(w*pi_2) )**2 + ( a*error_w/(pi_2*w2) )**2 );

      // let x_Gaussian: number[] = this.linspace(x0[0], x0[x0.length-1], 100);
      let gaussian: number[] = this.GaussianFunction(x0, a, w, mu, 0);
      // console.log('gaussian:', gaussian);
      // console.log('error_a:', error_a);
      // console.log('error_w:', error_w);
      // console.log('error_w2:', error_w2);
      // console.log('error_mu:', error_mu);
      // console.log('error_sigma:', error_sigma);
      // console.log('error_FWHM:', error_FWHM);
      // console.log('error_yc:', error_yc);


      // console.log('------------ FIN AJUSTE GAUSSIANO ------------------');
      return [gaussian, [yc, w, mu, a, FWHM], [error_yc, error_w, error_mu, error_a, error_FWHM]]

    } catch (e) {
      console.log(e);
    }
  }

  
  GaussianFitting(x0: number[], y0: number[], error_y0: number[]) {
    try {
      console.log('x0:', x0);
      console.log('y0:', y0);
      console.log('error_y0:', error_y0);
      for (let i = 0; i < y0.length; i++) {
        let finite: boolean = isFinite(y0[i])
        // console.log('finite:', finite);
        if (isNaN(y0[i]) || !finite ) {
          y0.splice(i, 1);
          x0.splice(i, 1);
          error_y0.splice(i, 1);
          i = i - 1;
        }   
      }
      console.log('x0_aft:', x0);
      console.log('y0_aft:', y0);
      console.log('error_y0_aft:', error_y0);
      let error: number[] = [];
      let y_offset = this.linspace(0.5*y0[0], 2*y0[y0.length-1], 100);
      // console.log('y_offset:', y_offset);
      for (let index = 0; index < y_offset.length; index++) {

        let result = this.Gaussian(x0, y0, y_offset[index], error_y0);
        // console.log('result:', result);
        let g = this.SumElementArray(y_offset[index], result[0]);
        error[index] = this.sum( this.PowElementsArray(this.SubsTwoArrays(g, y0), 2) );
      }
      // console.log('error:', error);
      for (let i = 0; i < error.length; i++) {   
        if (isNaN(error[i])) {
          error.splice(i, 1);
          y_offset.splice(i, 1);
          i = i - 1;
        }   
      }
      
      let EMC: number = error.indexOf( Math.min(...error) );
      // console.log('error_split:', error);
      // console.log('EMC:', EMC);
      // console.log('y_offset_split:', y_offset);
      
      
      let gauss = this.Gaussian(x0, y0, y_offset[EMC], error_y0);
      // console.log('gauss:', gauss);
      let sigma = +(gauss[1][1]/2).toFixed(3);
      let a = +gauss[1][3].toFixed(3);
      let yc = +gauss[1][0].toFixed(3);
      let w = +gauss[1][1].toFixed(3);
      let mu = +gauss[1][2].toFixed(3);
      let FWHM = +gauss[1][4].toFixed(3);
      let y_0 = +y_offset[EMC].toFixed(3);

      let error_sigma = +(gauss[2][1]/2).toFixed(3);
      let error_a = +gauss[2][3].toFixed(3);
      let error_yc = +gauss[2][0].toFixed(3);
      let error_w = +gauss[2][1].toFixed(3);
      let error_mu = +gauss[2][2].toFixed(3);
      let error_FWHM = +gauss[2][4].toFixed(3);

      // console.log('error_a:', error_a);
      // console.log('error_w:', error_w);
      // console.log('error_mu:', error_mu);
      // console.log('error_sigma:', error_sigma);
      // console.log('error_FWHM:', error_FWHM);
      // console.log('error_yc:', error_yc);
      // console.log('5555555555');
      let x_Gaussian: number[] = this.linspace(x0[0], x0[x0.length-1], 100);
      let gaussian: number[] = this.GaussianFunction(x_Gaussian, gauss[1][3], gauss[1][1], gauss[1][2], y_offset[EMC]);

      let y0_mean: number = this.sum(y0) /y0.length;
      let f: number[] = this.GaussianFunction(x0, gauss[1][3], gauss[1][1], gauss[1][2], y_offset[EMC]);
      let SS_tot: number = this.sum( this.PowElementsArray(this.SubsElementArray(y0_mean, y0), 2) );
      let SS_res: number = this.sum( this.PowElementsArray(this.SubsTwoArrays(y0, f), 2) );
      let R_squared: number = 1 - SS_res / SS_tot;
      R_squared = +R_squared.toFixed(5);
      // console.log('R_squared:', R_squared);

      x_Gaussian = this.RoundArray(x_Gaussian, 3);
      gaussian = this.RoundArray(gaussian, 3);
      // console.log('x0_aft:', x0);
      // console.log('y0_aft:', y0);
      // console.log('error_y0_aft:', error_y0);
      // console.log('x_Gaussian:', x_Gaussian);
      // console.log('gaussian:', gaussian);
      // console.log('error_y0:', error_y0);
      return [x_Gaussian, gaussian, [yc, sigma, mu, a, FWHM, y_0, R_squared],  [error_yc, error_sigma, error_mu, error_a, error_FWHM]]
      
    } catch (e) {
      console.log(e);
    }
  }


  // GaussianFitting(x0: number[], y0: number[]) {
  //   console.log('------------ AJUSTE GAUSSIANO ------------------');

  //   console.log('y0: ', y0);
  //   for (let i = 0; i < y0.length; i++) {
  //     // console.log('y0[i]:', y0[i]);
  //     if (isNaN(y0[i])) {
  //       // console.log('in splice');
  //       y0.splice(i,1);
  //       x0.splice(i,1);
  //       // console.log('y0: ', y0);
  //     }   
  //   }
  //   // console.log('y0: ', y0);
    
  //   let y_offset: number = Math.min(...y0)*0.99;
  //   let y_no_offset: number[] = this.SubsElementArray(y_offset, y0);
  //   let y_max: number= Math.max(...y0);
  //   // console.log('x0: ', x0);
  //   // // console.log('y0: ', y0);
  //   // console.log('y_offset: ', y_offset);
  //   // console.log('y_no_offset: ', y_no_offset);
  //   // console.log('y_max: ', y_max);
  //   // let y_max: number= Math.max(...y_no_offset);
  //   let x: number[] = [];
  //   let y: number[] = [];
  //   // let threshold: number = y_max*0.1;
  //   let threshold: number = (y_max - y_offset)*0.2 + y_offset;
  //   // console.log('threshold: ', threshold);
  //   for (let i = 0; i < y0.length; i++) {

  //     if (y0[i] > threshold) {
  //       y.push(y_no_offset[i]);
  //       x.push(x0[i]);
  //     }
  //   }
  //   // console.log('x: ', x);
  //   // console.log('y: ', y);

  //   // y_Quadratic = A + Bx + Cx^2;
  //   let y_Quadratic: number[] = [];
  //   for (let i = 0; i < y.length; i++) {
  //     y_Quadratic[i] = Math.log(y[i]);
  //   }

  //   let n: number = x.length;
  //   let x2: number[] = this.PowElementsArray(x,2);
  //   let mean_x: number = this.sum(x)/n;
  //   let mean_y: number = this.sum(y_Quadratic)/n;
  //   let mean_x2: number = this.sum(x2)/n;
  //   // let Sxx = this.sumatorio((x - mean_x)**2)
  //   // let Sxy = this.sumatorio((x-mean_x)*(y_Quadratic-mean_y))
  //   // let Sxx2 = this.sumatorio((x-mean_x)*(x**2-mean_x2))
  //   // let Sx2x2 = this.sumatorio((x**2-mean_x2)**2)
  //   // let Sx2y = this.sumatorio((x**2-mean_x2)*(y_Quadratic-mean_y))
  //   let Sxx: number = this.sum( this.PowElementsArray(this.SubsElementArray(mean_x, x), 2) );
  //   let Sxy: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_y, y_Quadratic)) );
  //   let Sxx2: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x, x), this.SubsElementArray(mean_x2, x2)) );
  //   let Sx2x2: number = this.sum( this.PowElementsArray(this.SubsElementArray(mean_x2, x2), 2) );
  //   let Sx2y: number = this.sum( this.ProductElementsArray(this.SubsElementArray(mean_x2, x2), this.SubsElementArray(mean_y, y_Quadratic)));

  //   let B: number = ( Sxy*Sx2x2 - Sx2y*Sxx2 )/( Sxx*Sx2x2 - Sxx2**2 );
  //   let C: number = ( Sx2y*Sxx - Sxy*Sxx2 )/( Sxx*Sx2x2 - Sxx2**2 );
  //   let A: number = mean_y - B*mean_x - C*mean_x2;
  //   // let r = np.sqrt( 1 - ( this.sumatorio(y_Quadratic - (A+B*x+C*x**2))**2 ) / ( this.sumatorio((y_Quadratic - mean_y)**2) ) )
    

  //   // console.log('x_Gaussian:', x0[0], x0[x0.length-1]);
  //   // console.log('y_Quadratic: ', y_Quadratic);
  //   // console.log('n: ', n);
  //   // console.log('mean_x: ', mean_x);
  //   // console.log('mean_y: ', mean_y);
  //   // console.log('mean_x2: ', mean_x2);
  //   // console.log('Sxx: ', Sxx);
  //   // console.log('Sxy: ', Sxy);
  //   // console.log('Sxx2: ', Sxx2);
  //   // console.log('Sx2x2: ', Sx2x2);
  //   // console.log('Sx2y: ', Sx2y);
  //   // console.log('B: ', B);
  //   // console.log('C: ', C);
  //   // console.log('A: ', A);

  //   let sigma: number = +(0.5*(Math.sqrt(-2/C)));
  //   let w2: number = -2/C;
  //   let w: number = Math.sqrt(-2/C);
  //   let mu : number= B*w2 / 4;
  //   let a: number = Math.exp( A + (2*mu**2)/w2 + Math.log( w*Math.sqrt(Math.PI/2) ) );
  //   let FWHM: number = Math.sqrt(2*Math.log(2))*w2;
  //   let yc: number = y_offset + a / (w * Math.sqrt(Math.PI/2));

  //   let x_Gaussian: number[] = this.linspace(x0[0], x0[x0.length-1], 100);
  //   let gaussian: number[] = this.GaussianFunction(x_Gaussian, a, w, mu, y_offset);

  //   x_Gaussian = this.RoundArray(x_Gaussian, 3);
  //   gaussian = this.RoundArray(gaussian, 3);
  //   sigma = +sigma.toFixed(3);
  //   a = +a.toFixed(3);
  //   yc = +yc.toFixed(3);
  //   w = +w.toFixed(3);
  //   mu = +mu.toFixed(3);
  //   FWHM = +FWHM.toFixed(3);
    
  //   console.log('A:', a);
  //   console.log('w (w = 2*sigma):', w);
  //   console.log('mu:', mu);
  //   console.log('sigma:', sigma);
  //   console.log('FWHM:', FWHM);

  //   console.log('------------ FIN AJUSTE GAUSSIANO ------------------');
  //   return [x_Gaussian, gaussian, [yc, sigma, mu, a, FWHM]]
  // }



}
