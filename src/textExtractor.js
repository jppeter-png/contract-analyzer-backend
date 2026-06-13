const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts plain text from an uploaded file buffer.
 * Supports PDF, DOCX, and plain text files.
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} mimetype - MIME type of the file
 * @param {string} originalname - Original filename (used as fallback for type detection)
 * @returns {Promise<string>} Extracted plain text
 */
async function extractText(buffer, mimetype, originalname) {
  const ext = (originalname || '').split('.').pop().toLowerCase();

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  // Default: treat as plain text (UTF-8)
  return buffer.toString('utf-8');
}

module.exports = { extractText };
