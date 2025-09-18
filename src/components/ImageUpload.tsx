"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiLoader } from 'react-icons/fi';

interface ImageUploadProps {
  type: 'product' | 'avatar' | 'cover';
  userId?: string;
  onUpload: (imageData: { url: string; originalName?: string }) => void;
  onRemove?: (imageUrl: string) => void;
  currentImage?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

interface UploadedImage {
  url: string;
  originalName?: string;
  file?: File;
}

export default function ImageUpload({
  type,
  userId,
  onUpload,
  onRemove,
  currentImage,
  multiple = false,
  maxFiles = 5,
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    currentImage ? [{ url: currentImage, originalName: 'current-image' }] : []
  );
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (disabled || uploading) return;
    
    const filesToUpload = Array.from(files).slice(0, multiple ? maxFiles - images.length : 1);
    
    setUploading(true);
    
    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (userId) {
          formData.append('userId', userId);
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        
        if (result.success) {
          const newImage = {
            url: result.data.url,
            originalName: result.data.originalName,
            file
          };
          
          if (multiple) {
            setImages(prev => [...prev, newImage]);
          } else {
            setImages([newImage]);
          }
          
          onUpload({
            url: result.data.url,
            originalName: result.data.originalName
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const image = images[index];
    
    if (image.url && onRemove) {
      try {
        await onRemove(image.url);
      } catch (error) {
        console.error('Remove error:', error);
        alert('Failed to remove image');
        return;
      }
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getPlaceholderDimensions = () => {
    switch (type) {
      case 'avatar':
        return { width: 200, height: 200, aspectRatio: '1:1' };
      case 'cover':
        return { width: 400, height: 150, aspectRatio: '8:3' };
      case 'product':
        return { width: 300, height: 300, aspectRatio: '1:1' };
      default:
        return { width: 300, height: 300, aspectRatio: '1:1' };
    }
  };

  const dimensions = getPlaceholderDimensions();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {(multiple || images.length === 0) && (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
            ${dragActive 
              ? 'border-indigo-400 bg-indigo-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          style={{ aspectRatio: dimensions.aspectRatio }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FiLoader className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-gray-600 font-medium">Uploading...</p>
              <p className="text-sm text-gray-500">Please wait</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FiUpload className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium mb-1">
                {type === 'avatar' ? 'Upload Profile Picture' :
                 type === 'cover' ? 'Upload Cover Photo' :
                 'Upload Product Images'}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WebP up to 10MB
              </p>
              {multiple && (
                <p className="text-xs text-gray-400 mt-1">
                  Max {maxFiles} images
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden"
              style={{ aspectRatio: dimensions.aspectRatio }}
            >
              <Image
                src={image.url}
                alt={`${type} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                disabled={disabled}
              >
                <FiX className="w-4 h-4" />
              </button>
              
              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">
                  {image.file?.name || 'Uploaded image'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FiLoader className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-sm text-indigo-800">Uploading to cloud storage...</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 10MB per image</p>
        {type === 'avatar' && <p>• Recommended: Square images (1:1 ratio)</p>}
        {type === 'cover' && <p>• Recommended: Wide images (8:3 ratio)</p>}
        {multiple && <p>• You can upload multiple images</p>}
      </div>
    </div>
  );
}