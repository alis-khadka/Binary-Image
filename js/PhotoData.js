class PhotoData {

  constructor() {
    this.img = document.getElementById('uploaded-image');
    this.uploadButton = document.getElementById('upload-button')

    // Canvas to draw the image
    this.canvas = document.getElementById('uploaded-image-canvas');
    this.context = this.canvas.getContext('2d');

    // Canvas for Grayscaling
    this.grayscaleCanvas = document.getElementById('grayscale-image');
    this.grayscaleContext = this.grayscaleCanvas.getContext('2d');

    // Canvas for Noise Reduced Grayscale
    this.noiseReducedCanvas = document.getElementById('noise-reduced-image');
    this.noiseReducedContext = this.noiseReducedCanvas.getContext('2d');

    // Canvas for Binary Image (Thresholding)
    this.thresholdCanvas = document.getElementById('threshold-image');
    this.thresholdContext = this.thresholdCanvas.getContext('2d');

    // Headings
    this.uploadHeading = document.getElementById('upload-heading');
    this.grayscaleHeading = document.getElementById('grayscale-heading');
    this.noiseReducedHeading = document.getElementById('noise-reduced-heading');
    this.thresholdHeading = document.getElementById('threshold-heading');

    this.uploadHeading.style.display = 'none';
    this.grayscaleHeading.style.display = 'none';
    this.noiseReducedHeading.style.display = 'none';
    this.thresholdHeading.style.display = 'none';

    // Image Data
    this.imageData;
    this.grayscaleData;
    this.noiseReducedData;
    this.thresholdData;

  }

  initializeCanvas(canvas, sourceImage) {
    canvas.width = sourceImage.img.naturalWidth;
    canvas.height = sourceImage.img.naturalHeight;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

  }

  initializeHeading(heading) {
    heading.style.display = 'block';
    heading.style.textAlign = 'center';
  }

  changeTo2dArray(imageData) {
    let width = imageData.width * 4; // Pixel = RGBA value
    let height = imageData.height;

    let pixels = imageData.data;

    let array2D = new Array(height);

    for (let i = 0; i < height; i++) {
      array2D[i] = new Array(width);

      for (let j = 0; j < width; j += 4) {
        array2D[i][j] = pixels[(i * width) + (j)]; // Red Pixel
        array2D[i][j + 1] = pixels[(i * width) + (j + 1)]; // Green Pixel
        array2D[i][j + 2] = pixels[(i * width) + (j + 2)]; // Blue Pixel
        array2D[i][j + 3] = pixels[(i * width) + (j + 3)]; // Alpha Pixel

      }
    }

    return array2D;

  }

  changeTo1dArray(array2D) {
    let width = array2D[0].length;
    let height = array2D.length;

    let array1D = new Uint8ClampedArray(width * height);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j += 4) {
        array1D[(i * width) + (j)] = array2D[i][j]; // Red Pixel
        array1D[(i * width) + (j + 1)] = array2D[i][j + 1]; // Green Pixel
        array1D[(i * width) + (j + 2)] = array2D[i][j + 2]; // Blue Pixel
        array1D[(i * width) + (j + 3)] = array2D[i][j + 3]; // Alpha Pixel

      }
    }

    return array1D;

  }

  assign1dToImageData(imageData, array1D) {
    let pixels = imageData.data;
    let len = pixels.length;

    for (let i = 0; i < len; i += 4) {
      pixels[i] = array1D[i]; // Red Pixel
      pixels[i + 1] = array1D[i + 1]; // Green Pixel
      pixels[i + 2] = array1D[i + 2]; // Blue Pixel
      pixels[i + 3] = array1D[i + 3]; // Alpha Pixel

    }

  }

  // Converting into Grayscale Value
  getGrayscaleValue(sourceImage) {
    let pixels2D = this.changeTo2dArray(sourceImage.imageData);
    let grayscalePixels2D = this.changeTo2dArray(sourceImage.grayscaleData);

    let width = pixels2D[0].length;
    let height = pixels2D.length;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j += 4) {
        let redPixel = pixels2D[i][j];
        let greenPixel = pixels2D[i][j + 1];
        let bluePixel = pixels2D[i][j + 2];
        let alphaPixel = pixels2D[i][j + 3];

        let grayscaleMax = Math.max(redPixel, greenPixel, bluePixel);
        let grayscaleMin = Math.min(redPixel, greenPixel, bluePixel);
        let grayscaleValue = (grayscaleMax + grayscaleMin) / 2;

        grayscalePixels2D[i][j] = grayscaleValue;
        grayscalePixels2D[i][j + 1] = grayscaleValue;
        grayscalePixels2D[i][j + 2] = grayscaleValue;
        grayscalePixels2D[i][j + 3] = alphaPixel;

      }
    }

    let grayscalePixels1D = this.changeTo1dArray(grayscalePixels2D);
    this.assign1dToImageData(sourceImage.grayscaleData, grayscalePixels1D);

  }

  // After image is loaded
  imageIsLoaded(sourceImage) {
    this.initializeHeading(sourceImage.uploadHeading);
    this.initializeCanvas(sourceImage.canvas, sourceImage);

    //Drawing the received Image on Canvas
    sourceImage.context.drawImage(
      sourceImage.img,
      0,
      0,
      sourceImage.img.naturalWidth,
      sourceImage.img.naturalHeight
    );

    // Get Image Data
    sourceImage.imageData = sourceImage.context.getImageData(
      0,
      0,
      sourceImage.img.naturalWidth,
      sourceImage.img.naturalHeight
    );
    console.log(sourceImage.imageData.data.length);

    // Create Grayscale Data
    sourceImage.grayscaleData = sourceImage.grayscaleContext.createImageData(sourceImage.imageData);

    this.getGrayscaleValue(sourceImage);
    this.initializeHeading(sourceImage.grayscaleHeading);

    console.log('imageData: ', sourceImage.imageData);
    console.log('grayscaleData: ', sourceImage.grayscaleData);

    this.initializeCanvas(sourceImage.grayscaleCanvas, sourceImage);

    sourceImage.grayscaleContext.putImageData(sourceImage.grayscaleData, 0, 0);

    // Create Noise Reduce Data
    sourceImage.noiseReducedData = sourceImage.noiseReducedContext.createImageData(sourceImage.grayscaleData);

    // Noise reduction
    this.getNoiseReduction(sourceImage, 2, 'gaussian filter');
    this.initializeHeading(sourceImage.noiseReducedHeading);
    this.initializeCanvas(sourceImage.noiseReducedCanvas, sourceImage);

    console.log('noiseReducedData: ', sourceImage.noiseReducedData);

    sourceImage.noiseReducedContext.putImageData(sourceImage.noiseReducedData, 0, 0);

    // Create Threshold Data
    sourceImage.thresholdData = sourceImage.thresholdContext.createImageData(sourceImage.grayscaleData);

    // Get thresholding
    // this.getThresholdingValue(sourceImage, 175);
    this.getLocalThresholdingValue(sourceImage, 5);

    console.log('threshold Data: ', sourceImage.thresholdData);

    // Binary Image
    this.initializeHeading(sourceImage.thresholdHeading);
    this.initializeCanvas(sourceImage.thresholdCanvas, sourceImage);

    sourceImage.thresholdContext.putImageData(sourceImage.thresholdData, 0, 0);

  }

  getNoiseReduction(sourceImage, kernelSize, method) {
    let kernelRadius = (kernelSize - 1) / 2;
    let standardDeviation = kernelRadius / Math.log10(255);

    let gaussianKernel = this.getGaussianKernel(
      kernelRadius,
      kernelSize,
      standardDeviation
    );

    console.log('gaussianKernel: ', gaussianKernel);

    switch (method) {

      // By default, Mean value for reducing noise,
      case undefined:
        method = 'mean filter';
        this.applyMeanFilter(
          sourceImage,
          kernelSize
        );
        break;

      // Gaussian Blur for reducing noise.
      case 'gaussian filter':
        this.applyGaussianFilter(
          sourceImage,
          gaussianKernel
        );

    }
  }

  applyMeanFilter(sourceImage, kernelSize) {
    let grayscalePixels2D = this.changeTo2dArray(sourceImage.grayscaleData);
    let noiseReducedPixels2D = this.changeTo2dArray(sourceImage.noiseReducedData);

    let widthGrayscale = grayscalePixels2D[0].length;
    let heightGrayscale = grayscalePixels2D.length;

    let widthKernel = kernelSize * 4;
    let heightKernel = kernelSize;

    let numOfPixels = heightKernel * (widthKernel / 4);

    for (let i = 0; i < heightGrayscale; i += heightKernel) {

      if (i >= (heightGrayscale - heightKernel)) {
        i = (heightGrayscale - heightKernel);
      }

      for (let j = 0; j < widthGrayscale; j += widthKernel) {

        if (j >= (widthGrayscale - widthKernel)) {
          j = (widthGrayscale - widthKernel);
        }

        let sum = 0;

        for (let m = i; m < (i + heightKernel); m++) {


          for (let n = j; n < (j + widthKernel); n += 4) {
            sum += grayscalePixels2D[m][n];

          }

        }

        let meanValue = Math.round(sum / numOfPixels);

        for (let m = i; m < (i + heightKernel); m++) {


          for (let n = j; n < (j + widthKernel); n += 4) {

            noiseReducedPixels2D[m][n] = meanValue;
            noiseReducedPixels2D[m][n + 1] = meanValue;
            noiseReducedPixels2D[m][n + 2] = meanValue;
            noiseReducedPixels2D[m][n + 3] = grayscalePixels2D[m][n + 3]; // No change in Alpha value


          }

        }

        meanValue = 0;
      }
    }

    let noiseReducedPixels1D = this.changeTo1dArray(noiseReducedPixels2D);
    this.assign1dToImageData(sourceImage.noiseReducedData, noiseReducedPixels1D);
  }

  applyGaussianFilter(sourceImage, gaussianKernel) {
    let grayscalePixels2D = this.changeTo2dArray(sourceImage.grayscaleData);
    let noiseReducedPixels2D = this.changeTo2dArray(sourceImage.noiseReducedData);

    let paddedNoiseReducedPixels2D = this.addZeroPadding(grayscalePixels2D, gaussianKernel.length);
    let paddedGrayscalePixels2D = this.addZeroPadding(grayscalePixels2D, gaussianKernel.length);

    // let widthGrayscale = grayscalePixels2D[0].length;
    // let heightGrayscale = grayscalePixels2D.length;

    let widthKernel = gaussianKernel[0].length;
    let heightKernel = gaussianKernel.length;
    let onePixel = 4; // RGBA takes 4 places in row representation

    let heightPadding = heightKernel - 1;
    let widthPadding = widthKernel - onePixel;

    let widthPadded = paddedNoiseReducedPixels2D[0].length;
    let heightPadded = paddedNoiseReducedPixels2D.length;

    for (let i = 0; i < heightPadded; i++) {

      if (i >= (heightPadded - heightPadding)) {
        continue;
      }

      for (let j = 0; j < widthPadded; j += 4) {

        if (j > (widthPadded - widthPadding - onePixel)) {
          continue;
        }

        let windowBottom = i + (heightKernel - 1);
        let windowEnd = j + (widthKernel - onePixel);

        let redPixelValue = 0;
        let greenPixelValue = 0;
        let bluePixelValue = 0;

        for (let kernelY = 0, m = i; m < (i + heightKernel); kernelY++ , m++) {
          for (let kernelX = 0, n = j; n < (j + widthKernel); kernelX += 4, n += 4) {

            redPixelValue += Math.floor(paddedGrayscalePixels2D[m][n] * gaussianKernel[kernelY][kernelX]);
            greenPixelValue += Math.floor(paddedGrayscalePixels2D[m][n + 1] * gaussianKernel[kernelY][kernelX + 1]);
            bluePixelValue += Math.floor(paddedGrayscalePixels2D[m][n + 2] * gaussianKernel[kernelY][kernelX + 2]);

          }

        }

        paddedNoiseReducedPixels2D[windowBottom][windowEnd] = redPixelValue;
        paddedNoiseReducedPixels2D[windowBottom][windowEnd + 1] = greenPixelValue;
        paddedNoiseReducedPixels2D[windowBottom][windowEnd + 2] = bluePixelValue;
        paddedNoiseReducedPixels2D[windowBottom][windowEnd + 3] = paddedGrayscalePixels2D[windowBottom][windowEnd + 3]; // No change in alpha pixel

      }

    }

    noiseReducedPixels2D = this.removeZeroPadding(paddedNoiseReducedPixels2D, gaussianKernel.length);

    let noiseReducedPixels1D = this.changeTo1dArray(noiseReducedPixels2D);
    this.assign1dToImageData(sourceImage.noiseReducedData, noiseReducedPixels1D);

  }

  getGaussianKernel(radius, kernelSize, standardDeviation) {
    let height = kernelSize;
    let width = kernelSize * 4;

    let PI = Math.PI;

    let gaussianKernel = new Array(height);

    for (let i = 0; i < height; i++) {
      gaussianKernel[i] = new Array(width);

      for (let j = 0; j < width; j += 4) {

        // Calculating gaussian value 
        let x = radius - (j / 4);
        let y = radius - i;

        let exp = Math.exp(
          -(
            (x * x) + (y * y)
            /
            (2 * (standardDeviation * standardDeviation))
          )
        );

        let gaussianValue = exp / (2 * PI * standardDeviation * standardDeviation);

        // Assigning gaussian value to gaussian kernel

        gaussianKernel[i][j] = gaussianValue;
        gaussianKernel[i][j + 1] = gaussianValue;
        gaussianKernel[i][j + 2] = gaussianValue;
        gaussianKernel[i][j + 3] = 255;

      }
    }

    return gaussianKernel;

  }

  getThresholdingValue(sourceImage, threshold) {
    let grayscalePixels2D = this.changeTo2dArray(sourceImage.grayscaleData);
    let binaryPixels2D = this.changeTo2dArray(sourceImage.thresholdData);

    let width = grayscalePixels2D[0].length;
    let height = grayscalePixels2D.length;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j += 4) {
        let binaryValue = (grayscalePixels2D[i][j] >= threshold) ? 255 : 0;

        binaryPixels2D[i][j] = binaryValue;
        binaryPixels2D[i][j + 1] = binaryValue;
        binaryPixels2D[i][j + 2] = binaryValue;
        binaryPixels2D[i][j + 3] = grayscalePixels2D[i][j + 3];

      }
    }

    let binaryPixels1D = this.changeTo1dArray(binaryPixels2D);
    this.assign1dToImageData(sourceImage.thresholdData, binaryPixels1D);

  }

  getLocalThresholdingValue(sourceImage, windowSize) {
    let grayscalePixels2D = this.changeTo2dArray(sourceImage.noiseReducedData);
    let binaryPixels2D = this.changeTo2dArray(sourceImage.thresholdData);

    let width = grayscalePixels2D[0].length;
    let height = grayscalePixels2D.length;

    let windowWidth = windowSize * 4;
    let windowHeight = windowSize;

    let numOfPixels = windowSize * windowSize;

    for (let i = 0; i < height; i += windowHeight) {

      if (i >= (height - windowHeight)) {
        i = (height - windowHeight);
      }

      for (let j = 0; j < width; j += windowWidth) {

        if (j >= (width - windowWidth)) {
          j = (width - windowWidth);
        }

        let sum = 0;

        for (let m = i; m < (i + windowHeight); m++) {

          for (let n = j; n < (j + windowWidth); n += 4) {
            sum += grayscalePixels2D[m][n];
          }

        }

        let localThreshold = Math.floor(sum / numOfPixels);
        // console.log('local threshold', localThreshold);

        for (let m = i; m < (i + windowHeight); m++) {

          for (let n = j; n < (j + windowWidth); n += 4) {
            let binaryValue = (grayscalePixels2D[m][n] >= localThreshold) ? 255 : 0;

            binaryPixels2D[m][n] = binaryValue;
            binaryPixels2D[m][n + 1] = binaryValue;
            binaryPixels2D[m][n + 2] = binaryValue;
            binaryPixels2D[m][n + 3] = grayscalePixels2D[m][n + 3];
          }

        }

        sum = 0;

      }
    }

    let binaryPixels1D = this.changeTo1dArray(binaryPixels2D);
    this.assign1dToImageData(sourceImage.thresholdData, binaryPixels1D);

  }

  addZeroPadding(array2D, kernelSize) {
    let widthArray2D = array2D[0].length;
    let heightArray2D = array2D.length;

    let widthKernel = kernelSize * 4;
    let heightKernel = kernelSize;

    let onePixel = 4; // RGBA takes 4 places in row representation

    let widthPaddedArray2D = widthArray2D + (widthKernel - onePixel) * 2;
    let heightPaddedArray2D = heightArray2D + (heightKernel - 1) * 2;

    let paddedArray2D = new Array(heightPaddedArray2D);

    let heightPadding = heightKernel - 1;
    let widthPadding = widthKernel - onePixel;

    // At first, initializing with zero values
    for (let i = 0; i < heightPaddedArray2D; i++) {
      paddedArray2D[i] = new Array(widthPaddedArray2D);

      for (let j = 0; j < widthPaddedArray2D; j += 4) {
        paddedArray2D[i][j] = 0;
        paddedArray2D[i][j + 1] = 0;
        paddedArray2D[i][j + 2] = 0;
        paddedArray2D[i][j + 3] = 0;

      }

    }

    // Adding received array data to padded array
    for (let i = 0; i < heightPaddedArray2D; i++) {

      // Leaving zero padding as it is
      if (i < heightPadding) {
        continue;
      }

      if (i >= (heightPaddedArray2D - heightPadding)) {
        continue;
      }

      let Y = i - heightPadding;

      for (let j = 0; j < widthPaddedArray2D; j += 4) {

        // Leaving zero padding as it is
        if (j < widthPadding) {
          continue;
        }

        if (j >= (widthPaddedArray2D - widthPadding)) {
          continue;
        }

        let X = j - widthPadding;

        paddedArray2D[i][j] = array2D[Y][X];
        paddedArray2D[i][j + 1] = array2D[Y][X + 1];
        paddedArray2D[i][j + 2] = array2D[Y][X + 2];
        paddedArray2D[i][j + 3] = array2D[Y][X + 3];

      }

    }

    return paddedArray2D;

  }

  removeZeroPadding(paddedArray2D, kernelSize) {
    let widthKernel = kernelSize * 4;
    let heightKernel = kernelSize;
    
    let onePixel = 4; // RGBA takes 4 places in row representation

    let widthPaddedArray2D = paddedArray2D[0].length;
    let heightPaddedArray2D = paddedArray2D.length;

    let widthArray2D = widthPaddedArray2D - (widthKernel - onePixel) * 2;
    let heightArray2D = heightPaddedArray2D - (heightKernel - 1) * 2;

    let heightPadding = heightKernel - 1;
    let widthPadding = widthKernel - onePixel;
    
    // Structuring array2D
    let array2D = new Array(heightArray2D);

    for (let i =0;i<heightArray2D;i++){
      array2D[i] = new Array(widthArray2D);

    }

    // Assigning received padded array's data to array2D
    for (let i = 0; i < heightPaddedArray2D; i++) {

      // Leaving zero padding as it is
      if (i < heightPadding) {
        continue;
      }
      
      if (i >= (heightPaddedArray2D - heightPadding)) {
        continue;
      }

      let Y = i - heightPadding;

      for (let j = 0; j < widthPaddedArray2D; j += 4) {

        // Leaving zero padding as it is
        if (j < widthPadding) {
          continue;
        }

        if (j >= (widthPaddedArray2D - widthPadding)) {
          continue;
        }

        let X = j - widthPadding;

        array2D[Y][X] = paddedArray2D[i][j];
        array2D[Y][X+1] = paddedArray2D[i][j+1];
        array2D[Y][X+2] = paddedArray2D[i][j+2];
        array2D[Y][X+3] = paddedArray2D[i][j+3];

      }

    }

    return array2D;

  }

  eventListener(sourceImage) {
    this.uploadButton.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        // console.log(image.img);
        sourceImage.img.src = URL.createObjectURL(this.files[0]); // set src to blob url
        sourceImage.img.onload = function () {
          sourceImage.imageIsLoaded(sourceImage);
        };
      }
    });

  }

}