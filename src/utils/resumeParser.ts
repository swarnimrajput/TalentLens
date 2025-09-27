// src/utils/resumeParser.ts
import mammoth from 'mammoth';

export async function parseResume(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll use a simple text extraction
          // In a real application, you might want to use a more robust PDF parser
          const text = await extractTextFromPDF(arrayBuffer);
          resolve(text);
        } else if (file.name.endsWith('.docx')) {
          // For DOCX files, use mammoth
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } else {
          reject(new Error('Unsupported file type'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Simple PDF text extraction (basic implementation)
async function extractTextFromPDF(_arrayBuffer: ArrayBuffer): Promise<string> {
  // This is a very basic implementation
  // In a real application, you would use a proper PDF parsing library
  // For now, we'll return a placeholder text
  return 'PDF content extraction not implemented. Please use DOCX format for now.';
}