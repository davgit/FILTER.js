/**
*
* Histogram Equalize Plugin, Histogram Equalize for grayscale images Plugin, RGB Histogram Equalize Plugin
* @package FILTER.js
*
**/
!function(FILTER){
"use strict";

var notSupportClamp=FILTER._notSupportClamp, A32F=FILTER.Array32F,
    RGB2YCbCr=FILTER.Color.RGB2YCbCr, YCbCr2RGB=FILTER.Color.YCbCr2RGB
;

// a simple histogram equalizer filter  http://en.wikipedia.org/wiki/Histogram_equalization
FILTER.Create({
    name : "HistogramEqualizeFilter"
    
    ,path: FILTER.getPath( ModuleFactory__FILTER_PLUGINS.moduleUri )
    
    // this is the filter actual apply method routine
    ,apply: function(im, w, h/*, image*/) {
        // im is a copy of the image data as an image array
        // w is image width, h is image height
        // image is the original image instance reference, generally not needed
        // for this filter, no need to clone the image data, operate in-place
        var self = this;
        if ( !self._isOn ) return im;
        var r,g,b, rangeI,  maxI = 0, minI = 255,
            cdfI, accum = 0, t0, t1, t2,
            i, y, l=im.length, l2=l>>2, n=1.0/(l2), ycbcr, rgba
        ;
        
        // initialize the arrays
        cdfI = new A32F(256);
        for (i=0; i<256; i+=8)
        { 
            // partial loop unrolling
            cdfI[i]=0; 
            cdfI[i+1]=0; 
            cdfI[i+2]=0; 
            cdfI[i+3]=0; 
            cdfI[i+4]=0; 
            cdfI[i+5]=0; 
            cdfI[i+6]=0; 
            cdfI[i+7]=0; 
        }
        
        // compute pdf and maxima/minima
        for (i=0; i<l; i+=4)
        {
            //r = im[i]; g = im[i+1]; b = im[i+2];
            ycbcr = RGB2YCbCr(im.subarray(i,i+3));
            r = im[i] = ~~ycbcr[2]; g = im[i+1] = ~~ycbcr[0]; b = im[i+2] = ~~ycbcr[1];
            cdfI[ g ] += n;
            
            if ( g>maxI ) maxI=g;
            else if ( g<minI ) minI=g;
        }
        
        // compute cdf
        accum = 0;
        for (i=0; i<256; i+=8)
        { 
            // partial loop unrolling
            accum += cdfI[i]; cdfI[i] = accum;
            accum += cdfI[i+1]; cdfI[i+1] = accum;
            accum += cdfI[i+2]; cdfI[i+2] = accum;
            accum += cdfI[i+3]; cdfI[i+3] = accum;
            accum += cdfI[i+4]; cdfI[i+4] = accum;
            accum += cdfI[i+5]; cdfI[i+5] = accum;
            accum += cdfI[i+6]; cdfI[i+6] = accum;
            accum += cdfI[i+7]; cdfI[i+7] = accum;
        }
        
        // equalize only the intesity channel
        rangeI = maxI-minI;
        if (notSupportClamp)
        {   
            for (i=0; i<l; i+=4)
            { 
                ycbcr = [im[i+1], im[i+2], im[i]];
                ycbcr[0] = cdfI[ycbcr[0]]*rangeI + minI;
                rgba = YCbCr2RGB(ycbcr);
                t0 = rgba[0]; t1 = rgba[1]; t2 = rgba[2]; 
                // clamp them manually
                t0 = (t0<0) ? 0 : ((t0>255) ? 255 : t0);
                t1 = (t1<0) ? 0 : ((t1>255) ? 255 : t1);
                t2 = (t2<0) ? 0 : ((t2>255) ? 255 : t2);
                im[i] = ~~t0; im[i+1] = ~~t1; im[i+2] = ~~t2; 
            }
        }
        else
        {
            for (i=0; i<l; i+=4)
            { 
                ycbcr = [im[i+1], im[i+2], im[i]];
                ycbcr[0] = cdfI[ycbcr[0]]*rangeI + minI;
                rgba = YCbCr2RGB(ycbcr);
                im[i] = ~~rgba[0]; im[i+1] = ~~rgba[1]; im[i+2] = ~~rgba[2]; 
            }
        }
        
        // return the new image data
        return im;
    }
});

// a simple grayscale histogram equalizer filter  http://en.wikipedia.org/wiki/Histogram_equalization
FILTER.Create({
    name: "GrayscaleHistogramEqualizeFilter"
    
    ,path: FILTER.getPath( ModuleFactory__FILTER_PLUGINS.moduleUri )
    
    // this is the filter actual apply method routine
    ,apply: function(im, w, h/*, image*/) {
        // im is a copy of the image data as an image array
        // w is image width, h is image height
        // image is the original image instance reference, generally not needed
        // for this filter, no need to clone the image data, operate in-place
        var self = this;
        if ( !self._isOn ) return im;
        var c, g, rangeI, maxI=0, minI=255,
            cdfI, accum=0, t0, t1, t2,
            i, l=im.length, l2=l>>2, n=1.0/(l2)
            ;
        
        // initialize the arrays
        cdfI = new A32F(256);
        for (i=0; i<256; i+=8)
        { 
            // partial loop unrolling
            cdfI[i]=0; 
            cdfI[i+1]=0; 
            cdfI[i+2]=0; 
            cdfI[i+3]=0; 
            cdfI[i+4]=0; 
            cdfI[i+5]=0; 
            cdfI[i+6]=0; 
            cdfI[i+7]=0; 
        }
        
        // compute pdf and maxima/minima
        for (i=0; i<l; i+=4)
        {
            c = im[i];  // image is already grayscale
            cdfI[c] += n;
            
            if (c>maxI) maxI=c;
            else if (c<minI) minI=c;
        }
        
        // compute cdf
        accum = 0;
        for (i=0; i<256; i+=8)
        { 
            // partial loop unrolling
            accum += cdfI[i]; cdfI[i] = accum;
            accum += cdfI[i+1]; cdfI[i+1] = accum;
            accum += cdfI[i+2]; cdfI[i+2] = accum;
            accum += cdfI[i+3]; cdfI[i+3] = accum;
            accum += cdfI[i+4]; cdfI[i+4] = accum;
            accum += cdfI[i+5]; cdfI[i+5] = accum;
            accum += cdfI[i+6]; cdfI[i+6] = accum;
            accum += cdfI[i+7]; cdfI[i+7] = accum;
        }
        
        // equalize the grayscale/intesity channels
        rangeI = maxI-minI;
        if (notSupportClamp)
        {   
            for (i=0; i<l; i+=4)
            { 
                c = im[i]; // grayscale image has same value in all channels
                g = cdfI[c]*rangeI + minI;
                // clamp them manually
                g = (g<0) ? 0 : ((g>255) ? 255 : g);
                g = ~~g;
                im[i] = g; im[i+1] = g; im[i+2] = g; 
            }
        }
        else
        {
            for (i=0; i<l; i+=4)
            { 
                c = im[i]; // grayscale image has same value in all channels
                g = ~~( cdfI[c]*rangeI + minI );
                im[i] = g; im[i+1] = g; im[i+2] = g; 
            }
        }
        
        // return the new image data
        return im;
    }
});

// a sample RGB histogram equalizer filter  http://en.wikipedia.org/wiki/Histogram_equalization
// used for illustration purposes on how to create a plugin filter
FILTER.Create({
    name: "RGBHistogramEqualizeFilter"
    
    ,path: FILTER.getPath( ModuleFactory__FILTER_PLUGINS.moduleUri )
    
    // this is the filter actual apply method routine
    ,apply: function(im, w, h/*, image*/) {
        // im is a copy of the image data as an image array
        // w is image width, h is image height
        // image is the original image instance reference, generally not needed
        // for this filter, no need to clone the image data, operate in-place
        var self = this;
        if ( !self._isOn ) return im;
        var r,g,b, rangeR, rangeG, rangeB,
            maxR=0, maxG=0, maxB=0, minR=255, minG=255, minB=255,
            cdfR, cdfG, cdfB,
            accumR, accumG, accumB, t0, t1, t2,
            i, l=im.length, l2=l>>2, n=1.0/(l2)
        ;
        
        // initialize the arrays
        cdfR=new A32F(256); cdfG=new A32F(256); cdfB=new A32F(256);
        for (i=0; i<256; i+=8)
        { 
            // partial loop unrolling
            cdfR[i]=0; cdfG[i]=0; cdfB[i]=0; 
            cdfR[i+1]=0; cdfG[i+1]=0; cdfB[i+1]=0; 
            cdfR[i+2]=0; cdfG[i+2]=0; cdfB[i+2]=0; 
            cdfR[i+3]=0; cdfG[i+3]=0; cdfB[i+3]=0; 
            cdfR[i+4]=0; cdfG[i+4]=0; cdfB[i+4]=0; 
            cdfR[i+5]=0; cdfG[i+5]=0; cdfB[i+5]=0; 
            cdfR[i+6]=0; cdfG[i+6]=0; cdfB[i+6]=0; 
            cdfR[i+7]=0; cdfG[i+7]=0; cdfB[i+7]=0; 
        }
        
        // compute pdf and maxima/minima
        for (i=0; i<l; i+=4)
        {
            r = im[i]; g = im[i+1]; b = im[i+2];
            cdfR[r] += n; cdfG[g] += n; cdfB[b] += n;
            
            if (r>maxR) maxR=r;
            else if (r<minR) minR=r;
            if (g>maxG) maxG=g;
            else if (g<minG) minG=g;
            if (b>maxB) maxB=b;
            else if (b<minB) minB=b;
        }
        
        // compute cdf
        accumR=accumG=accumB=0;
        for (i=0; i<256; i+=8)
        { 
            // partial loop unrolling
            accumR+=cdfR[i]; cdfR[i]=accumR; 
            accumG+=cdfG[i]; cdfG[i]=accumG; 
            accumB+=cdfB[i]; cdfB[i]=accumB; 
            accumR+=cdfR[i+1]; cdfR[i+1]=accumR; 
            accumG+=cdfG[i+1]; cdfG[i+1]=accumG; 
            accumB+=cdfB[i+1]; cdfB[i+1]=accumB; 
            accumR+=cdfR[i+2]; cdfR[i+2]=accumR; 
            accumG+=cdfG[i+2]; cdfG[i+2]=accumG; 
            accumB+=cdfB[i+2]; cdfB[i+2]=accumB; 
            accumR+=cdfR[i+3]; cdfR[i+3]=accumR; 
            accumG+=cdfG[i+3]; cdfG[i+3]=accumG; 
            accumB+=cdfB[i+3]; cdfB[i+3]=accumB; 
            accumR+=cdfR[i+4]; cdfR[i+4]=accumR; 
            accumG+=cdfG[i+4]; cdfG[i+4]=accumG; 
            accumB+=cdfB[i+4]; cdfB[i+4]=accumB; 
            accumR+=cdfR[i+5]; cdfR[i+5]=accumR; 
            accumG+=cdfG[i+5]; cdfG[i+5]=accumG; 
            accumB+=cdfB[i+5]; cdfB[i+5]=accumB; 
            accumR+=cdfR[i+6]; cdfR[i+6]=accumR; 
            accumG+=cdfG[i+6]; cdfG[i+6]=accumG; 
            accumB+=cdfB[i+6]; cdfB[i+6]=accumB; 
            accumR+=cdfR[i+7]; cdfR[i+7]=accumR; 
            accumG+=cdfG[i+7]; cdfG[i+7]=accumG; 
            accumB+=cdfB[i+7]; cdfB[i+7]=accumB; 
        }
        
        // equalize each channel separately
        rangeR=maxR-minR; rangeG=maxG-minG; rangeB=maxB-minB;
        if (notSupportClamp)
        {   
            for (i=0; i<l; i+=4)
            { 
                r = im[i]; g = im[i+1]; b = im[i+2]; 
                t0 = cdfR[r]*rangeR + minR; t1 = cdfG[g]*rangeG + minG; t2 = cdfB[b]*rangeB + minB; 
                // clamp them manually
                t0 = (t0<0) ? 0 : ((t0>255) ? 255 : t0);
                t1 = (t1<0) ? 0 : ((t1>255) ? 255 : t1);
                t2 = (t2<0) ? 0 : ((t2>255) ? 255 : t2);
                im[i] = ~~t0; im[i+1] = ~~t1; im[i+2] = ~~t2; 
            }
        }
        else
        {
            for (i=0; i<l; i+=4)
            { 
                r = im[i]; g = im[i+1]; b = im[i+2]; 
                t0 = cdfR[r]*rangeR + minR; t1 = cdfG[g]*rangeG + minG; t2 = cdfB[b]*rangeB + minB; 
                im[i] = ~~t0; im[i+1] = ~~t1; im[i+2] = ~~t2; 
            }
        }
        
        // return the new image data
        return im;
    }
});

}(FILTER);