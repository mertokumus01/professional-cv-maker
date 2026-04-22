import DOMPurify from 'isomorphic-dompurify';

// XSS Koruması için string sanitization
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
};

// HTML input sanitization
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html;
  return DOMPurify.sanitize(html);
};

// Email sanitization
export const sanitizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase().replace(/[^a-zA-Z0-9@._-]/g, '');
};

// URL sanitization
export const sanitizeURL = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
};

// Object recursive sanitization
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

export default {
  sanitizeString,
  sanitizeHTML,
  sanitizeEmail,
  sanitizeURL,
  sanitizeObject,
};
