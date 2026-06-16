const { Document, Packer, Paragraph, TextRun, PageBreak } = require('docx');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const logger = require('./logger');

/**
 * Generate DOCX from CV data
 * @param {Object} cv - CV object with data
 * @param {String} outputPath - Where to save the DOCX
 * @returns {Promise<String>} Path to generated DOCX
 */
const generateCVDOCX = async (cv, outputPath) => {
  try {
    const sections = [];

    // Title
    sections.push(
      new Paragraph({
        text: `${cv.firstName} ${cv.lastName}`,
        heading: 'Heading 1',
        spacing: { after: 200 },
      })
    );

    // Contact Info
    const contactInfo = [];
    if (cv.email) contactInfo.push(cv.email);
    if (cv.phoneNumber) contactInfo.push(cv.phoneNumber);
    
    if (contactInfo.length > 0) {
      sections.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          spacing: { after: 400 },
        })
      );
    }

    // Professional Summary
    if (cv.bio) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: 'Heading 2',
          spacing: { before: 200, after: 200 },
        })
      );
      sections.push(
        new Paragraph({
          text: cv.bio,
          spacing: { after: 400 },
        })
      );
    }

    // Experience
    if (cv.experience && cv.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EXPERIENCE',
          heading: 'Heading 2',
          spacing: { before: 200, after: 200 },
        })
      );

      cv.experience.forEach((exp) => {
        sections.push(
          new Paragraph({
            text: exp.jobTitle || '',
            spacing: { before: 100, after: 50 },
            bold: true,
          })
        );

        if (exp.company) {
          sections.push(
            new Paragraph({
              text: exp.company,
              spacing: { after: 50 },
            })
          );
        }

        if (exp.startDate || exp.endDate) {
          const dates = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
          sections.push(
            new Paragraph({
              text: dates,
              spacing: { after: 100 },
            })
          );
        }

        if (exp.description) {
          sections.push(
            new Paragraph({
              text: exp.description,
              spacing: { after: 200 },
            })
          );
        }
      });
    }

    // Education
    if (cv.education && cv.education.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: 'Heading 2',
          spacing: { before: 200, after: 200 },
        })
      );

      cv.education.forEach((edu) => {
        sections.push(
          new Paragraph({
            text: edu.degree || '',
            spacing: { before: 100, after: 50 },
            bold: true,
          })
        );

        if (edu.school) {
          sections.push(
            new Paragraph({
              text: edu.school,
              spacing: { after: 50 },
            })
          );
        }

        if (edu.graduationDate) {
          sections.push(
            new Paragraph({
              text: `Graduated: ${edu.graduationDate}`,
              spacing: { after: 100 },
            })
          );
        }

        if (edu.description) {
          sections.push(
            new Paragraph({
              text: edu.description,
              spacing: { after: 200 },
            })
          );
        }
      });
    }

    // Skills
    if (cv.skills && cv.skills.length > 0) {
      sections.push(
        new Paragraph({
          text: 'SKILLS',
          heading: 'Heading 2',
          spacing: { before: 200, after: 200 },
        })
      );

      const skillsText = cv.skills.map(s => s.name || s).join(', ');
      sections.push(
        new Paragraph({
          text: skillsText,
          spacing: { after: 400 },
        })
      );
    }

    // Languages
    if (cv.languages && cv.languages.length > 0) {
      sections.push(
        new Paragraph({
          text: 'LANGUAGES',
          heading: 'Heading 2',
          spacing: { before: 200, after: 200 },
        })
      );

      cv.languages.forEach((lang) => {
        const level = lang.proficiency ? ` - ${lang.proficiency}` : '';
        sections.push(
          new Paragraph({
            text: `${lang.name}${level}`,
            spacing: { after: 100 },
          })
        );
      });
    }

    // Certifications
    if (cv.certifications && cv.certifications.length > 0) {
      sections.push(
        new Paragraph({
          text: 'CERTIFICATIONS',
          heading: 'Heading 2',
          spacing: { before: 200, after: 200 },
        })
      );

      cv.certifications.forEach((cert) => {
        sections.push(
          new Paragraph({
            text: cert.name || '',
            spacing: { after: 50 },
            bold: true,
          })
        );

        if (cert.issuer) {
          sections.push(
            new Paragraph({
              text: `Issued by: ${cert.issuer}`,
              spacing: { after: 100 },
            })
          );
        }
      });
    }

    // Create document
    const doc = new Document({
      sections: [{
        children: sections,
      }],
    });

    // Generate and write file
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    logger.info('DOCX generated successfully:', outputPath);
    return outputPath;
  } catch (error) {
    logger.error('DOCX generation error:', error);
    throw error;
  }
};

/**
 * Generate CSV from CV data
 * @param {Object} cv - CV object with data
 * @param {String} outputPath - Where to save the CSV
 * @returns {Promise<String>} Path to generated CSV
 */
const generateCVCSV = async (cv, outputPath) => {
  try {
    // Prepare data for CSV
    const records = [];

    // Header info
    records.push({
      field: 'First Name',
      value: cv.firstName || '',
    });
    records.push({
      field: 'Last Name',
      value: cv.lastName || '',
    });
    records.push({
      field: 'Email',
      value: cv.email || '',
    });
    records.push({
      field: 'Phone',
      value: cv.phoneNumber || '',
    });
    records.push({
      field: 'Bio',
      value: cv.bio || '',
    });

    // Experience
    if (cv.experience && cv.experience.length > 0) {
      records.push({
        field: 'EXPERIENCE',
        value: '',
      });
      cv.experience.forEach((exp) => {
        records.push({
          field: 'Job Title',
          value: exp.jobTitle || '',
        });
        records.push({
          field: 'Company',
          value: exp.company || '',
        });
        records.push({
          field: 'Duration',
          value: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
        });
        records.push({
          field: 'Description',
          value: exp.description || '',
        });
      });
    }

    // Education
    if (cv.education && cv.education.length > 0) {
      records.push({
        field: 'EDUCATION',
        value: '',
      });
      cv.education.forEach((edu) => {
        records.push({
          field: 'Degree',
          value: edu.degree || '',
        });
        records.push({
          field: 'School',
          value: edu.school || '',
        });
        records.push({
          field: 'Graduation Date',
          value: edu.graduationDate || '',
        });
        records.push({
          field: 'Description',
          value: edu.description || '',
        });
      });
    }

    // Skills
    if (cv.skills && cv.skills.length > 0) {
      records.push({
        field: 'SKILLS',
        value: cv.skills.map(s => s.name || s).join(', '),
      });
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'field', title: 'Field' },
        { id: 'value', title: 'Value' },
      ],
      encoding: 'utf8',
    });

    // Write CSV file
    await csvWriter.writeRecords(records);

    logger.info('CSV generated successfully:', outputPath);
    return outputPath;
  } catch (error) {
    logger.error('CSV generation error:', error);
    throw error;
  }
};

/**
 * Generate JSON export from CV data
 * @param {Object} cv - CV object with data
 * @param {String} outputPath - Where to save the JSON
 * @returns {Promise<String>} Path to generated JSON
 */
const generateCVJSON = async (cv, outputPath) => {
  try {
    const jsonData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: 'CV Maker',
      },
      personalInfo: {
        firstName: cv.firstName || '',
        lastName: cv.lastName || '',
        email: cv.email || '',
        phoneNumber: cv.phoneNumber || '',
        bio: cv.bio || '',
      },
      experience: cv.experience || [],
      education: cv.education || [],
      skills: cv.skills || [],
      languages: cv.languages || [],
      certifications: cv.certifications || [],
    };

    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');

    logger.info('JSON generated successfully:', outputPath);
    return outputPath;
  } catch (error) {
    logger.error('JSON generation error:', error);
    throw error;
  }
};

module.exports = {
  generateCVDOCX,
  generateCVCSV,
  generateCVJSON,
};
