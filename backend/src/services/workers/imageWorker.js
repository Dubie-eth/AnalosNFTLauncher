/**
 * Worker for parallel image processing
 * This file runs in a separate thread to handle image compositing
 */

const sharp = require('sharp');

/**
 * Composite image from layers
 */
async function compositeImage(combination, layers) {
  try {
    let composite = sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    // Apply layers in order
    for (const layer of layers) {
      const trait = combination[layer.name];
      if (trait && layer.images && layer.images[trait]) {
        const imageBuffer = Buffer.from(layer.images[trait], 'base64');
        composite = composite.composite([{
          input: imageBuffer,
          blend: 'over'
        }]);
      }
    }

    return await composite.png().toBuffer();
  } catch (error) {
    throw new Error(`Image compositing failed: ${error.message}`);
  }
}

/**
 * Process a batch of NFT generations
 */
async function processBatch(batchData) {
  const { combinations, layers, startIndex } = batchData;
  const results = [];

  for (let i = 0; i < combinations.length; i++) {
    const combination = combinations[i];
    const tokenId = startIndex + i;
    
    try {
      const imageBuffer = await compositeImage(combination, layers);
      results.push({
        tokenId,
        imageBuffer: imageBuffer.toString('base64'),
        success: true
      });
    } catch (error) {
      results.push({
        tokenId,
        error: error.message,
        success: false
      });
    }
  }

  return results;
}

// Export functions for worker pool
module.exports = {
  compositeImage,
  processBatch
};
