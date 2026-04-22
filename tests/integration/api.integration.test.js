/**
 * Integration Tests for Auth API
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};

let authToken = null;
let userId = null;

describe('Auth API Integration Tests', () => {
  /**
   * Test user registration
   */
  test('should register a new user', async () => {
    const response = await axios.post(`${API_BASE}/auth/register`, testUser);

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.email).toBe(testUser.email);
    expect(response.data.data.token).toBeDefined();

    authToken = response.data.data.token;
    userId = response.data.data.user.id;
  });

  /**
   * Test user login
   */
  test('should login user with correct credentials', async () => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.token).toBeDefined();
  });

  /**
   * Test invalid login
   */
  test('should fail login with incorrect password', async () => {
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: 'WrongPassword',
      });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.success).toBe(false);
    }
  });

  /**
   * Test token verification
   */
  test('should verify valid token', async () => {
    const response = await axios.get(`${API_BASE}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.id).toBe(userId);
  });

  /**
   * Test password reset request
   */
  test('should request password reset', async () => {
    const response = await axios.post(`${API_BASE}/auth/request-password-reset`, {
      email: testUser.email,
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  /**
   * Test logout
   */
  test('should logout user', async () => {
    const response = await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
});

describe('CV API Integration Tests', () => {
  let cvId = null;

  /**
   * Test CV creation
   */
  test('should create a new CV', async () => {
    const response = await axios.post(
      `${API_BASE}/cvs`,
      {
        title: 'Test CV',
        template: 'classic',
        data: {
          personalInfo: {
            fullName: 'Test User',
            email: 'test@example.com',
          },
          summary: 'A test CV',
          experience: [],
          education: [],
          skills: [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.cv.title).toBe('Test CV');

    cvId = response.data.data.cv.id;
  });

  /**
   * Test getting all CVs
   */
  test('should get all user CVs', async () => {
    const response = await axios.get(`${API_BASE}/cvs`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.cvs)).toBe(true);
  });

  /**
   * Test getting single CV
   */
  test('should get single CV by ID', async () => {
    const response = await axios.get(`${API_BASE}/cvs/${cvId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.cv.id).toBe(cvId);
  });

  /**
   * Test CV update
   */
  test('should update CV', async () => {
    const response = await axios.put(
      `${API_BASE}/cvs/${cvId}`,
      {
        title: 'Updated Test CV',
        data: {
          personalInfo: {
            fullName: 'Updated Test User',
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.cv.title).toBe('Updated Test CV');
  });

  /**
   * Test CV deletion
   */
  test('should delete CV', async () => {
    const response = await axios.delete(`${API_BASE}/cvs/${cvId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
});

describe('User API Integration Tests', () => {
  /**
   * Test getting user profile
   */
  test('should get user profile', async () => {
    const response = await axios.get(`${API_BASE}/users/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.id).toBe(userId);
  });

  /**
   * Test updating user profile
   */
  test('should update user profile', async () => {
    const response = await axios.put(
      `${API_BASE}/users/profile`,
      {
        firstName: 'UpdatedTest',
        phoneNumber: '+1234567890',
        bio: 'Updated bio',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.firstName).toBe('UpdatedTest');
  });
});
