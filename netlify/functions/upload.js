exports.handler = async (event, context) => {
  // CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { file, metadata } = JSON.parse(event.body);
    
    // Validate required fields
    if (!file || !metadata.title || !metadata.category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: file, title, or category' 
        }),
      };
    }

    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid file type. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.' 
        }),
      };
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File size exceeds 50MB limit' 
        }),
      };
    }

    // In a real implementation, you would:
    // 1. Store the file in a cloud storage service (AWS S3, Google Cloud Storage, etc.)
    // 2. Update the database with file metadata
    // 3. Generate thumbnails if needed
    // 4. Run virus scanning
    // 5. Send notifications

    // For demo purposes, we'll simulate a successful upload
    const fileId = Date.now().toString();
    const uploadPath = `notes/${metadata.category}/${file.name}`;
    
    const fileRecord = {
      id: fileId,
      name: file.name,
      title: metadata.title,
      category: metadata.category,
      description: metadata.description || '',
      url: uploadPath,
      uploadDate: new Date().toISOString().split('T')[0],
      size: formatFileSize(file.size),
      downloads: 0,
      thumbnail: generateThumbnailUrl(metadata.category)
    };

    // Return success response with file metadata
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'File uploaded successfully',
        file: fileRecord
      }),
    };

  } catch (error) {
    console.error('Upload error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error during file upload' 
      }),
    };
  }
};

// Helper functions
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)}${units[unitIndex]}`;
}

function generateThumbnailUrl(category) {
  const thumbnails = {
    'data-structures': 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400',
    'algorithms': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    'databases': 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400',
    'web-development': 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400',
    'machine-learning': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
    'operating-systems': 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400',
    'computer-networks': 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
    'software-engineering': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    'mobile-development': 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=400',
    'programming-languages': 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return thumbnails[category] || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400';
}