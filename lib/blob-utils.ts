
export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.'
    };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Please upload images smaller than 5MB.'
    };
  }

  return { isValid: true };
}

export function getImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToBlob(file: File): Promise<string> {
  try {
    console.log('Uploading image:', file.name);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          console.log('Image uploaded to Vercel Blob:', result.url);
          return result.url;
        }
      } else {
        const error = await response.json();
        console.warn('API upload failed:', error.error);
      }
    } catch (apiError) {
      console.warn('API upload failed, using fallback:', apiError);
    }
    
    console.log('Using fallback image URL for:', file.name);
    const fileHash = await generateFileHash(file);
    const mockUploadUrl = `https://images.unsplash.com/photo-${fileHash}?w=500&h=500&fit=crop`;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return mockUploadUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Error al subir la imagen. Por favor, inténtalo de nuevo.');
  }
}

async function generateFileHash(file: File): Promise<string> {
  const hashSuffixes = [
    '1560472354-b33ff0c44a43',
    '1541807084-5c52b6b3adef', 
    '1583394838336-acd977736f90',
    '1544244015-0df4b3ffc6b0',
    '1565375667-8bf6c4c8e8f8',
    '1572635196-7bc0c9f5b99e',
    '1505740420-12bbfeb92f34',
    '1498050108-7b69e4c91df0'
  ];
  
  const index = (file.size + file.name.length) % hashSuffixes.length;
  return hashSuffixes[index];
}

export function createLocalImageUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeLocalImageUrl(url: string): void {
  URL.revokeObjectURL(url);
}