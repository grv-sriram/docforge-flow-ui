
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

export const createMockPDF = (filename: string): Blob => {
  // Create a simple mock PDF content for demonstration
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(${filename}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;
  
  return new Blob([pdfContent], { type: 'application/pdf' });
};

export const createMockDocument = (filename: string, format: string): Blob => {
  let content: string;
  let mimeType: string;
  
  switch (format.toLowerCase()) {
    case 'pdf':
      return createMockPDF(filename);
    case 'docx':
      content = `Mock Word document content for ${filename}`;
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    case 'txt':
      content = `Mock text content for ${filename}\n\nThis is a sample text file.`;
      mimeType = 'text/plain';
      break;
    case 'rtf':
      content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 Mock RTF content for ${filename}}`;
      mimeType = 'application/rtf';
      break;
    case 'html':
      content = `<!DOCTYPE html><html><head><title>${filename}</title></head><body><h1>Mock HTML content</h1><p>This is a sample HTML file for ${filename}</p></body></html>`;
      mimeType = 'text/html';
      break;
    default:
      content = `Mock content for ${filename}`;
      mimeType = 'application/octet-stream';
  }
  
  return new Blob([content], { type: mimeType });
};

// New function for creating split documents
export const createSplitDocument = (originalFilename: string, pageNumbers: number[], namingPattern: string): { name: string; content: Blob }[] => {
  const originalExtension = originalFilename.split('.').pop()?.toLowerCase() || 'pdf';
  const baseName = originalFilename.split('.').slice(0, -1).join('.');
  
  return pageNumbers.map(pageNum => {
    const fileName = namingPattern.replace('{n}', pageNum.toString());
    const fullFileName = `${fileName}.${originalExtension}`;
    const content = createMockDocument(fullFileName, originalExtension);
    
    return {
      name: fullFileName,
      content
    };
  });
};
