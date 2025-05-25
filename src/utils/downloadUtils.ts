
export const downloadFile = (blob: Blob, filename: string, mimeType: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const downloadZip = async (files: { name: string; content: Blob }[], zipName: string) => {
  // For now, we'll simulate ZIP creation by downloading individual files
  // In a real implementation, you'd use a library like JSZip
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadFile(file.content, file.name, 'application/octet-stream');
    }, index * 500); // Stagger downloads to avoid browser blocking
  });
};

// Create a proper document by copying the original file content
export const createProcessedDocument = async (originalFile: File, newFilename: string): Promise<Blob> => {
  // Read the original file content
  const arrayBuffer = await originalFile.arrayBuffer();
  
  // For now, we'll return the original content with proper metadata
  // In a real implementation, you would process the content based on the operation
  return new Blob([arrayBuffer], { type: originalFile.type });
};

// Create merged document from multiple files
export const createMergedDocument = async (files: File[], outputFilename: string): Promise<Blob> => {
  if (files.length === 0) {
    throw new Error('No files to merge');
  }
  
  // For PDF files, we'll concatenate the content (simplified approach)
  if (files[0].name.toLowerCase().endsWith('.pdf')) {
    const mergedContent: ArrayBuffer[] = [];
    
    for (const file of files) {
      const content = await file.arrayBuffer();
      mergedContent.push(content);
    }
    
    // In a real implementation, you would use a PDF library to properly merge
    // For now, we'll use the first file as base and add a marker
    const firstFileContent = await files[0].arrayBuffer();
    const mergedSize = mergedContent.reduce((sum, content) => sum + content.byteLength, 0);
    
    // Create a larger blob that represents the merged content
    const mergedBuffer = new ArrayBuffer(mergedSize);
    const mergedView = new Uint8Array(mergedBuffer);
    
    let offset = 0;
    for (const content of mergedContent) {
      const contentView = new Uint8Array(content);
      mergedView.set(contentView, offset);
      offset += contentView.length;
    }
    
    return new Blob([mergedBuffer], { type: 'application/pdf' });
  }
  
  // For text-based files, concatenate the text content
  if (files[0].type.startsWith('text/') || files[0].name.toLowerCase().endsWith('.txt')) {
    let mergedText = '';
    
    for (const file of files) {
      const text = await file.text();
      mergedText += text + '\n\n--- Document Break ---\n\n';
    }
    
    return new Blob([mergedText], { type: 'text/plain' });
  }
  
  // For other document types, use the first file as base
  const firstFileContent = await files[0].arrayBuffer();
  return new Blob([firstFileContent], { type: files[0].type });
};

// Create split documents from a single file
export const createSplitDocuments = async (
  originalFile: File, 
  pageNumbers: number[], 
  namingPattern: string
): Promise<{ name: string; content: Blob }[]> => {
  const originalExtension = originalFile.name.split('.').pop()?.toLowerCase() || 'pdf';
  const baseName = originalFile.name.split('.').slice(0, -1).join('.');
  const originalContent = await originalFile.arrayBuffer();
  
  return pageNumbers.map(pageNum => {
    const fileName = namingPattern.replace('{n}', pageNum.toString());
    const fullFileName = `${fileName}.${originalExtension}`;
    
    // In a real implementation, you would extract specific pages
    // For now, we'll create smaller chunks of the original file
    const chunkSize = Math.floor(originalContent.byteLength / pageNumbers.length);
    const startOffset = (pageNum - 1) * chunkSize;
    const endOffset = Math.min(startOffset + chunkSize, originalContent.byteLength);
    
    const chunkContent = originalContent.slice(startOffset, endOffset);
    const content = new Blob([chunkContent], { type: originalFile.type });
    
    return {
      name: fullFileName,
      content
    };
  });
};

// Convert document format
export const convertDocumentFormat = async (
  originalFile: File, 
  targetFormat: string, 
  filename: string
): Promise<Blob> => {
  const originalContent = await originalFile.arrayBuffer();
  
  // Determine the MIME type for the target format
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'html': 'text/html'
  };
  
  const targetMimeType = mimeTypes[targetFormat.toLowerCase()] || 'application/octet-stream';
  
  // For text conversions, extract text content
  if (targetFormat.toLowerCase() === 'txt') {
    try {
      const text = await originalFile.text();
      return new Blob([text], { type: 'text/plain' });
    } catch {
      // If can't extract text, create a text representation
      const textContent = `Converted from ${originalFile.name}\n\nOriginal file size: ${originalFile.size} bytes\nFile type: ${originalFile.type}`;
      return new Blob([textContent], { type: 'text/plain' });
    }
  }
  
  // For HTML conversion
  if (targetFormat.toLowerCase() === 'html') {
    let htmlContent = '';
    try {
      const text = await originalFile.text();
      htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Converted Document: ${originalFile.name}</h1>
    <pre>${text}</pre>
</body>
</html>`;
    } catch {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Converted Document: ${originalFile.name}</h1>
    <p>Original file size: ${originalFile.size} bytes</p>
    <p>Original file type: ${originalFile.type}</p>
</body>
</html>`;
    }
    return new Blob([htmlContent], { type: 'text/html' });
  }
  
  // For other formats, return the original content with new MIME type
  return new Blob([originalContent], { type: targetMimeType });
};
