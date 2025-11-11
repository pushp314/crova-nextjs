/**
 * Example: Product Image Upload - Complete Examples
 * 
 * This file contains practical examples of using the product image upload system
 * in various scenarios.
 */

// ============================================================
// Example 1: Upload Images from React Component
// ============================================================

import { useState } from 'react';
import { toast } from 'sonner';

export function ProductImageUploadExample() {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files: FileList) => {
    setIsUploading(true);
    
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      setImages([...images, ...data.urls]);
      toast.success(`Uploaded ${data.count} image(s)`);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        disabled={isUploading}
      />
      
      {/* Display uploaded images */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`Product ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Example 2: Create Product with Uploaded Images
// ============================================================

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  sizes: string[];
  colors: string[];
  featured?: boolean;
}

export async function createProductWithImages(
  files: File[],
  productData: CreateProductData
) {
  try {
    // Step 1: Upload images
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const uploadResponse = await fetch('/api/upload/product', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload images');
    }

    const { urls } = await uploadResponse.json();

    // Step 2: Create product with image URLs
    const productResponse = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        images: urls,
      }),
    });

    if (!productResponse.ok) {
      throw new Error('Failed to create product');
    }

    const product = await productResponse.json();
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Usage:
async function exampleUsage() {
  const files = [
    /* File objects from input */
  ];
  
  const productData = {
    name: 'Stylish T-Shirt',
    description: 'A comfortable cotton t-shirt',
    price: 29.99,
    stock: 100,
    categoryId: 'cat_xyz123',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Red', 'Blue', 'Black'],
    featured: true,
  };

  const product = await createProductWithImages(files, productData);
  console.log('Product created:', product);
}

// ============================================================
// Example 3: Update Product Images
// ============================================================

export async function updateProductImages(
  productId: string,
  newFiles: File[],
  existingImages: string[]
) {
  try {
    // Upload new images
    const formData = new FormData();
    newFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const uploadResponse = await fetch('/api/upload/product', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload images');
    }

    const { urls } = await uploadResponse.json();

    // Combine with existing images
    const allImages = [...existingImages, ...urls];

    // Update product
    const updateResponse = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: allImages,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update product');
    }

    return await updateResponse.json();
  } catch (error) {
    console.error('Error updating product images:', error);
    throw error;
  }
}

// ============================================================
// Example 4: Drag & Drop Implementation
// ============================================================

export function DragDropImageUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 3 * 1024 * 1024; // 3MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert('No valid files. Please upload JPEG, PNG, or WebP images under 3MB.');
      return;
    }

    // Upload files
    const formData = new FormData();
    validFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const response = await fetch('/api/upload/product', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setImages([...images, ...data.urls]);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-8 ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <p className="text-center">Drag & drop images here</p>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`Uploaded ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Example 5: Validate Files Before Upload
// ============================================================

interface ValidationResult {
  valid: File[];
  errors: string[];
}

export function validateProductImages(files: File[]): ValidationResult {
  const valid: File[] = [];
  const errors: string[] = [];
  
  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  const MAX_COUNT = 6;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (files.length > MAX_COUNT) {
    errors.push(`Maximum ${MAX_COUNT} images allowed. You selected ${files.length}.`);
    return { valid: [], errors };
  }

  files.forEach(file => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Invalid type. Only JPEG, PNG, and WebP allowed.`);
      return;
    }

    // Check size
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name}: Too large. Maximum size is 3MB.`);
      return;
    }

    valid.push(file);
  });

  return { valid, errors };
}

// Usage:
function handleFileInput(files: FileList) {
  const { valid, errors } = validateProductImages(Array.from(files));
  
  if (errors.length > 0) {
    errors.forEach(error => console.error(error));
    return;
  }

  // Proceed with upload
  uploadFiles(valid);
}

// ============================================================
// Example 6: Server-Side API Handler (for reference)
// ============================================================

/*
// This is what happens on the server (already implemented)

import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

export async function POST(req: Request) {
  // 1. Authenticate
  const session = await getCurrentUser();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. Authorize (Admin only)
  try {
    requireRole(session, ['ADMIN']);
  } catch (error) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // 3. Parse multipart form data
  const { files } = await parseFormData(req);

  // 4. Validate files
  // 5. Save to disk
  // 6. Return URLs

  return NextResponse.json({
    urls: ['/uploads/products/2025/11/image.jpg'],
    count: 1,
    message: 'Successfully uploaded 1 image(s)'
  });
}
*/

// ============================================================
// Example 7: Complete Product Creation Flow
// ============================================================

export class ProductService {
  static async createProductWithImages(
    files: File[],
    productData: Omit<CreateProductData, 'images'>
  ) {
    // Step 1: Validate files
    const { valid, errors } = validateProductImages(files);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    // Step 2: Upload images
    const formData = new FormData();
    valid.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const uploadResponse = await fetch('/api/upload/product', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.message || 'Upload failed');
    }

    const { urls } = await uploadResponse.json();

    // Step 3: Create product
    const createResponse = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        images: urls,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.message || 'Failed to create product');
    }

    return await createResponse.json();
  }
}

// Usage:
async function createNewProduct() {
  try {
    const files = [
      /* File objects */
    ];

    const product = await ProductService.createProductWithImages(files, {
      name: 'Summer Dress',
      description: 'Light and comfortable summer dress',
      price: 59.99,
      stock: 50,
      categoryId: 'cat_women_dresses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Blue', 'Pink'],
      featured: true,
    });

    console.log('✅ Product created:', product);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================
// Example 8: React Hook for Image Upload
// ============================================================

export function useProductImageUpload() {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]) => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate
      const { valid, errors } = validateProductImages(files);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Upload
      const formData = new FormData();
      valid.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const { urls } = await response.json();
      setImages(prev => [...prev, ...urls]);
      
      return urls;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImages([]);
    setError(null);
  };

  return {
    images,
    isUploading,
    error,
    uploadImages,
    removeImage,
    clearImages,
  };
}

// Usage in component:
function MyComponent() {
  const { images, isUploading, error, uploadImages, removeImage } = useProductImageUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        await uploadImages(Array.from(e.target.files));
        toast.success('Images uploaded!');
      } catch (error) {
        toast.error('Upload failed');
      }
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} disabled={isUploading} />
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index}>
            <img src={url} alt={`Product ${index + 1}`} />
            <button onClick={() => removeImage(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Export all examples
// ============================================================

export default {
  ProductImageUploadExample,
  createProductWithImages,
  updateProductImages,
  DragDropImageUpload,
  validateProductImages,
  ProductService,
  useProductImageUpload,
};
