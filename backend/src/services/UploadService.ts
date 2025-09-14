import { v4 as uuidv4 } from 'uuid';
import { config } from '../utils/env';
import sharp from 'sharp';

// Mock storage for demo purposes
const uploads = new Map<string, any>();

export class UploadService {
  /**
   * Upload single file
   */
  async uploadFile(data: {
    file: Express.Multer.File;
    layer: string;
    trait: string;
    value: string;
    weight: number;
  }): Promise<{
    uploadId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uri: string;
    layer: string;
    trait: string;
    value: string;
    weight: number;
    uploadedAt: Date;
  }> {
    try {
      const uploadId = uuidv4();
      const fileName = `${data.layer}_${data.trait}_${data.value}_${Date.now()}.png`;
      
      // Process image with Sharp
      const processedImage = await sharp(data.file.buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      // Generate mock URI
      const uri = `https://mock-storage.com/uploads/${uploadId}/${fileName}`;

      const uploadRecord = {
        uploadId,
        fileName,
        fileSize: processedImage.length,
        mimeType: data.file.mimetype,
        uri,
        layer: data.layer,
        trait: data.trait,
        value: data.value,
        weight: data.weight,
        uploadedAt: new Date(),
        status: 'completed',
        originalName: data.file.originalname
      };

      uploads.set(uploadId, uploadRecord);

      return uploadRecord;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    layer: string,
    trait: string
  ): Promise<{
    uploads: any[];
    total: number;
    successful: number;
    failed: number;
  }> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const upload = await this.uploadFile({
          file,
          layer,
          trait,
          value: file.originalname.replace(/\.[^/.]+$/, ''), // Remove extension
          weight: 1 // Default weight
        });
        return { success: true, upload };
      } catch (error) {
        console.error(`Upload failed for file ${index}:`, error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          fileName: file.originalname
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      uploads: successful.map(r => r.upload),
      total: files.length,
      successful: successful.length,
      failed: failed.length
    };
  }

  /**
   * Upload trait images
   */
  async uploadTraitImages(
    collectionId: string,
    files: Express.Multer.File[],
    traits: any[]
  ): Promise<{
    uploads: any[];
    total: number;
    collectionId: string;
  }> {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const trait = traits[index] || traits[0]; // Use first trait as fallback
        const upload = await this.uploadFile({
          file,
          layer: trait.layer || 'base',
          trait: trait.name || 'unknown',
          value: trait.value || file.originalname.replace(/\.[^/.]+$/, ''),
          weight: trait.weight || 1
        });
        return { success: true, upload };
      } catch (error) {
        console.error(`Trait image upload failed for file ${index}:`, error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          fileName: file.originalname
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => r.success);

    return {
      uploads: successful.map(r => r.upload),
      total: files.length,
      collectionId
    };
  }

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: string): Promise<any | null> {
    return uploads.get(uploadId) || null;
  }

  /**
   * Delete file
   */
  async deleteFile(uploadId: string): Promise<boolean> {
    return uploads.delete(uploadId);
  }

  /**
   * Get upload history for collection
   */
  async getUploadHistory(collectionId: string): Promise<any[]> {
    return Array.from(uploads.values())
      .filter(upload => upload.collectionId === collectionId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Get all uploads
   */
  async getAllUploads(): Promise<any[]> {
    return Array.from(uploads.values())
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Get uploads by layer
   */
  async getUploadsByLayer(layer: string): Promise<any[]> {
    return Array.from(uploads.values())
      .filter(upload => upload.layer === layer)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Get uploads by trait
   */
  async getUploadsByTrait(trait: string): Promise<any[]> {
    return Array.from(uploads.values())
      .filter(upload => upload.trait === trait)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Validate file
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${config.maxFileSize / 1024 / 1024}MB`
      };
    }

    // Check file type
    if (!config.allowedFileTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${config.allowedFileTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(): Promise<{
    totalUploads: number;
    totalSize: number;
    uploadsByType: { [key: string]: number };
    uploadsByLayer: { [key: string]: number };
    recentUploads: any[];
  }> {
    const allUploads = Array.from(uploads.values());
    
    const totalUploads = allUploads.length;
    const totalSize = allUploads.reduce((sum, upload) => sum + upload.fileSize, 0);
    
    const uploadsByType: { [key: string]: number } = {};
    const uploadsByLayer: { [key: string]: number } = {};
    
    allUploads.forEach(upload => {
      uploadsByType[upload.mimeType] = (uploadsByType[upload.mimeType] || 0) + 1;
      uploadsByLayer[upload.layer] = (uploadsByLayer[upload.layer] || 0) + 1;
    });

    const recentUploads = allUploads
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, 10);

    return {
      totalUploads,
      totalSize,
      uploadsByType,
      uploadsByLayer,
      recentUploads
    };
  }

  /**
   * Clean up old uploads
   */
  async cleanupOldUploads(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deletedCount = 0;
    
    for (const [uploadId, upload] of uploads.entries()) {
      if (upload.uploadedAt < cutoffDate) {
        uploads.delete(uploadId);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} old uploads`);
    return deletedCount;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    largestFile: any;
    smallestFile: any;
  }> {
    const allUploads = Array.from(uploads.values());
    
    if (allUploads.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        averageFileSize: 0,
        largestFile: null,
        smallestFile: null
      };
    }

    const totalFiles = allUploads.length;
    const totalSize = allUploads.reduce((sum, upload) => sum + upload.fileSize, 0);
    const averageFileSize = totalSize / totalFiles;
    
    const sortedBySize = allUploads.sort((a, b) => b.fileSize - a.fileSize);
    const largestFile = sortedBySize[0];
    const smallestFile = sortedBySize[sortedBySize.length - 1];

    return {
      totalFiles,
      totalSize,
      averageFileSize,
      largestFile,
      smallestFile
    };
  }
}
