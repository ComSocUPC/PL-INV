const { Matchers } = require('@pact-foundation/pact');
const axios = require('axios');

describe('API Gateway -> Auth Service Contract', () => {
  describe('Authentication Endpoint', () => {
    beforeEach(async () => {
      const interaction = {
        state: 'user exists',
        uponReceiving: 'a request for user authentication',
        withRequest: {
          method: 'POST',
          path: '/auth/login',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            email: 'test@example.com',
            password: 'password123'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            token: Matchers.like('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
            user: {
              id: Matchers.like(1),
              email: 'test@example.com',
              role: 'user'
            },
            expiresIn: Matchers.like('24h')
          }
        }
      };

      await global.provider.addInteraction(interaction);
    });

    it('should authenticate user and return token', async () => {
      const response = await axios.post(
        'http://localhost:9001/auth/login',
        {
          email: 'test@example.com',
          password: 'password123'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.token).toBeDefined();
      expect(response.data.user.email).toBe('test@example.com');
    });
  });

  describe('Token Validation Endpoint', () => {
    beforeEach(async () => {
      const interaction = {
        state: 'valid token exists',
        uponReceiving: 'a request to validate token',
        withRequest: {
          method: 'GET',
          path: '/auth/validate',
          headers: {
            'Authorization': 'Bearer valid-jwt-token'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            valid: true,
            user: {
              id: Matchers.like(1),
              email: 'test@example.com',
              role: 'user'
            }
          }
        }
      };

      await global.provider.addInteraction(interaction);
    });

    it('should validate token and return user info', async () => {
      const response = await axios.get(
        'http://localhost:9001/auth/validate',
        {
          headers: {
            'Authorization': 'Bearer valid-jwt-token'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(true);
      expect(response.data.user).toBeDefined();
    });
  });

  describe('Invalid Authentication', () => {
    beforeEach(async () => {
      const interaction = {
        state: 'user does not exist',
        uponReceiving: 'a request with invalid credentials',
        withRequest: {
          method: 'POST',
          path: '/auth/login',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            email: 'invalid@example.com',
            password: 'wrongpassword'
          }
        },
        willRespondWith: {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: false,
            error: 'Invalid credentials'
          }
        }
      };

      await global.provider.addInteraction(interaction);
    });

    it('should return 401 for invalid credentials', async () => {
      try {
        await axios.post(
          'http://localhost:9001/auth/login',
          {
            email: 'invalid@example.com',
            password: 'wrongpassword'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.error).toBe('Invalid credentials');
      }
    });
  });
});
