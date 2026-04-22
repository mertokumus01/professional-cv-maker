/**
 * CV Template Definitions
 */

export const CV_TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional and professional CV template',
    thumbnail: '/templates/classic.jpg',
    preview: '/templates/classic-preview.jpg',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'A contemporary and minimalist CV template',
    thumbnail: '/templates/modern.jpg',
    preview: '/templates/modern-preview.jpg',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'A colorful and creative CV template',
    thumbnail: '/templates/creative.jpg',
    preview: '/templates/creative-preview.jpg',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'A clean and simple CV template',
    thumbnail: '/templates/minimal.jpg',
    preview: '/templates/minimal-preview.jpg',
  },
};

export const DEFAULT_TEMPLATE = 'classic';

/**
 * Get all available templates
 */
export const getAllTemplates = () => {
  return Object.values(CV_TEMPLATES);
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId) => {
  return CV_TEMPLATES[templateId] || CV_TEMPLATES[DEFAULT_TEMPLATE];
};

/**
 * Validate template ID
 */
export const isValidTemplate = (templateId) => {
  return templateId in CV_TEMPLATES;
};

/**
 * Get template styles based on template type
 */
export const getTemplateStyles = (templateId) => {
  const styles = {
    classic: {
      headerFontSize: '24px',
      sectionTitleFontSize: '16px',
      accentColor: '#007bff',
      font: 'Georgia, serif',
    },
    modern: {
      headerFontSize: '28px',
      sectionTitleFontSize: '14px',
      accentColor: '#333333',
      font: 'Segoe UI, sans-serif',
    },
    creative: {
      headerFontSize: '32px',
      sectionTitleFontSize: '16px',
      accentColor: '#ff6b6b',
      font: 'Poppins, sans-serif',
    },
    minimal: {
      headerFontSize: '20px',
      sectionTitleFontSize: '12px',
      accentColor: '#666666',
      font: 'Arial, sans-serif',
    },
  };

  return styles[templateId] || styles[DEFAULT_TEMPLATE];
};

/**
 * Get template layout configuration
 */
export const getTemplateLayout = (templateId) => {
  const layouts = {
    classic: {
      layout: 'single-column',
      spacing: 'normal',
      columnsCount: 1,
    },
    modern: {
      layout: 'single-column',
      spacing: 'compact',
      columnsCount: 1,
    },
    creative: {
      layout: 'two-column',
      spacing: 'generous',
      columnsCount: 2,
    },
    minimal: {
      layout: 'single-column',
      spacing: 'tight',
      columnsCount: 1,
    },
  };

  return layouts[templateId] || layouts[DEFAULT_TEMPLATE];
};
