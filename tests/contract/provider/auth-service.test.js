const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

describe('Auth Service Contract Verification', () => {
  it('should validate the expectations of API Gateway', () => {
    const options = {
      provider: 'auth-service',
      providerBaseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
      pactUrls: [
        path.resolve(process.cwd(), 'pacts', 'api-gateway-auth-service.json')
      ],
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.PROVIDER_VERSION || '1.0.0',
      consumerVersionSelectors: [
        {
          tag: 'main',
          latest: true
        }
      ]
    };

    return new Verifier(options).verifyProvider();
  });
});
