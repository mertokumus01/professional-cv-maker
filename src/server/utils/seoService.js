const logger = require('./logger');

/**
 * Generate sitemap XML
 * @param {Array} urls - Array of URL objects
 * @returns {String} XML sitemap
 */
const generateSitemap = (urls) => {
  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach((url) => {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;

      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }

      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }

      if (url.priority) {
        xml += `    <priority>${url.priority}</priority>\n`;
      }

      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
  } catch (error) {
    logger.error('Sitemap generation error:', error);
    throw error;
  }
};

/**
 * Escape XML special characters
 */
const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};

/**
 * Generate sitemap index for multiple sitemaps
 * @param {Array} sitemaps - Array of sitemap URLs
 * @returns {String} Sitemap index XML
 */
const generateSitemapIndex = (sitemaps) => {
  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    sitemaps.forEach((sitemap) => {
      xml += '  <sitemap>\n';
      xml += `    <loc>${escapeXml(sitemap.loc)}</loc>\n`;

      if (sitemap.lastmod) {
        xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
      }

      xml += '  </sitemap>\n';
    });

    xml += '</sitemapindex>';

    return xml;
  } catch (error) {
    logger.error('Sitemap index generation error:', error);
    throw error;
  }
};

/**
 * Generate robots.txt
 */
const generateRobotsTxt = (siteUrl) => {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Allow: /api/cvs/share/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Crawl-delay: 1
Sitemap: ${siteUrl}/sitemap.xml
`;
};

module.exports = {
  generateSitemap,
  generateSitemapIndex,
  generateRobotsTxt,
  escapeXml,
};
