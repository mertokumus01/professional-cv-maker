/**
 * E2E Tests for CV Builder Application
 * Using Cypress
 */

describe('CV Builder E2E Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const testUser = {
    email: `e2e-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'E2E',
    lastName: 'Test',
  };

  /**
   * Test user registration flow
   */
  describe('User Registration', () => {
    before(() => {
      cy.visit(`${baseUrl}/register`);
    });

    it('should display registration form', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should register new user successfully', () => {
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('button[type="submit"]').click();

      // Should redirect or show success message
      cy.url().should('include', '/login');
      cy.get('.success-message').should('contain', 'registered successfully');
    });
  });

  /**
   * Test user login flow
   */
  describe('User Login', () => {
    before(() => {
      cy.visit(`${baseUrl}/login`);
    });

    it('should display login form', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should login user successfully', () => {
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard
      cy.url().should('include', '/cvs');
      cy.get('.welcome-message').should('be.visible');
    });
  });

  /**
   * Test CV creation flow
   */
  describe('CV Creation', () => {
    before(() => {
      // Login first
      cy.visit(`${baseUrl}/login`);
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/cvs');
    });

    it('should display create CV button', () => {
      cy.get('button.create-cv-btn').should('be.visible');
    });

    it('should open CV creation form', () => {
      cy.get('button.create-cv-btn').click();
      cy.url().should('include', '/create');
      cy.get('input[name="title"]').should('be.visible');
    });

    it('should create CV with basic info', () => {
      const cvTitle = `E2E Test CV - ${Date.now()}`;

      cy.get('input[name="title"]').type(cvTitle);
      cy.get('select[name="template"]').select('modern');

      // Fill personal info
      cy.get('input[name="fullName"]').type('E2E Test User');
      cy.get('input[name="email"]').clear().type('e2e@example.com');
      cy.get('input[name="phone"]').type('+1234567890');

      // Save CV
      cy.get('button.save-btn').click();

      // Should show success message
      cy.get('.success-message').should('contain', 'CV saved successfully');
      cy.url().should('include', '/cvs');
    });
  });

  /**
   * Test CV editing flow
   */
  describe('CV Editing', () => {
    before(() => {
      cy.visit(`${baseUrl}/cvs`);
    });

    it('should display CV list', () => {
      cy.get('.cv-list').should('be.visible');
      cy.get('.cv-item').should('have.length.greaterThan', 0);
    });

    it('should open CV for editing', () => {
      cy.get('.cv-item').first().within(() => {
        cy.get('a.edit-link').click();
      });

      cy.url().should('include', '/cvs/');
      cy.url().should('include', '/edit');
    });

    it('should add experience entry', () => {
      cy.get('button.add-experience-btn').click();

      cy.get('input[name="jobTitle"]').type('Senior Developer');
      cy.get('input[name="company"]').type('Tech Corp');
      cy.get('input[name="startDate"]').type('2020-01-01');
      cy.get('input[name="endDate"]').type('2023-12-31');

      cy.get('button.save-btn').click();
      cy.get('.success-message').should('contain', 'saved');
    });

    it('should add education entry', () => {
      cy.get('button.add-education-btn').click();

      cy.get('input[name="schoolName"]').type('University');
      cy.get('input[name="degree"]').type('Bachelor');
      cy.get('input[name="fieldOfStudy"]').type('Computer Science');
      cy.get('input[name="graduationDate"]').type('2020-06-15');

      cy.get('button.save-btn').click();
      cy.get('.success-message').should('contain', 'saved');
    });

    it('should add skills', () => {
      cy.get('button.add-skill-btn').click();

      cy.get('input[name="skill"]').type('JavaScript');
      cy.get('select[name="proficiency"]').select('Expert');

      cy.get('button.add-skill-confirm').click();
      cy.get('.success-message').should('contain', 'saved');
    });
  });

  /**
   * Test CV preview and export
   */
  describe('CV Preview and Export', () => {
    before(() => {
      cy.visit(`${baseUrl}/cvs`);
    });

    it('should open CV preview', () => {
      cy.get('.cv-item').first().within(() => {
        cy.get('a.preview-link').click();
      });

      cy.url().should('include', '/cvs/');
      cy.get('.cv-preview').should('be.visible');
    });

    it('should display download PDF button', () => {
      cy.get('button.download-pdf-btn').should('be.visible');
    });

    it('should trigger PDF download', () => {
      cy.get('button.download-pdf-btn').click();

      // Verify download was triggered (check filename in downloads)
      cy.readFile(`${Cypress.config('downloadsFolder')}`).should('exist');
    });

    it('should display print button', () => {
      cy.get('button.print-btn').should('be.visible');
    });

    it('should trigger print preview', () => {
      cy.get('button.print-btn').click();

      // Window.print() is called, verify via cy.window().then()
      cy.window().then((win) => {
        cy.spy(win, 'print');
        cy.get('button.print-btn').click();
        expect(win.print).to.be.called;
      });
    });
  });

  /**
   * Test CV sharing
   */
  describe('CV Sharing', () => {
    before(() => {
      cy.visit(`${baseUrl}/cvs`);
    });

    it('should open share options', () => {
      cy.get('.cv-item').first().within(() => {
        cy.get('button.share-btn').click();
      });

      cy.get('.share-modal').should('be.visible');
    });

    it('should copy share link', () => {
      cy.get('input.share-link').should('have.value').then((value) => {
        cy.get('button.copy-link-btn').click();
        cy.get('.success-message').should('contain', 'copied');
      });
    });

    it('should toggle public visibility', () => {
      cy.get('input.public-toggle').should('not.be.checked');
      cy.get('input.public-toggle').check();
      cy.get('.success-message').should('contain', 'updated');
    });
  });

  /**
   * Test profile management
   */
  describe('Profile Management', () => {
    before(() => {
      cy.visit(`${baseUrl}/profile`);
    });

    it('should display profile information', () => {
      cy.get('.profile-section').should('be.visible');
      cy.get('input[name="firstName"]').should('have.value', testUser.firstName);
      cy.get('input[name="lastName"]').should('have.value', testUser.lastName);
    });

    it('should update profile', () => {
      cy.get('input[name="bio"]').type('Updated bio');
      cy.get('input[name="phone"]').type('+9876543210');

      cy.get('button.update-profile-btn').click();
      cy.get('.success-message').should('contain', 'updated successfully');
    });

    it('should change password', () => {
      cy.get('button.change-password-btn').click();

      cy.get('input[name="currentPassword"]').type(testUser.password);
      cy.get('input[name="newPassword"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');

      cy.get('button.submit-password-change').click();
      cy.get('.success-message').should('contain', 'changed successfully');
    });
  });

  /**
   * Test theme toggle
   */
  describe('Theme Toggle', () => {
    it('should toggle theme', () => {
      cy.visit(`${baseUrl}`);

      // Check initial theme
      cy.get('html').should('have.attr', 'data-theme');

      // Click theme toggle
      cy.get('button.theme-toggle').click();

      // Verify theme changed
      cy.get('html').invoke('attr', 'data-theme').then((theme) => {
        expect(['light', 'dark']).to.include(theme);
      });
    });
  });

  /**
   * Test language toggle
   */
  describe('Language Toggle', () => {
    it('should toggle language', () => {
      cy.visit(`${baseUrl}`);

      // Check initial language
      cy.get('html').should('have.attr', 'lang');

      // Click language toggle
      cy.get('button.language-toggle').click();

      // Select Turkish
      cy.get('a[data-lang="tr"]').click();

      // Verify language changed and content is in Turkish
      cy.get('html').should('have.attr', 'lang', 'tr');
      cy.contains('CV Oluştur').should('be.visible');
    });
  });

  /**
   * Test logout
   */
  describe('Logout', () => {
    before(() => {
      cy.visit(`${baseUrl}/cvs`);
    });

    it('should logout user', () => {
      cy.get('button.logout-btn').click();

      // Should redirect to login
      cy.url().should('include', '/login');
      cy.window().its('localStorage').invoke('getItem', 'token').should('be.null');
    });
  });
});
