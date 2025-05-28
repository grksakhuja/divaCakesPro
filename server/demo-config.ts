// Demo/Testing Configuration
export const DEMO_MODE = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

export const demoConfig = {
  enableMockPayments: DEMO_MODE,
  enableMockDatabase: DEMO_MODE,
  simulatePaymentDelay: true,
  mockPaymentSuccessRate: 0.8, // 80% success rate for testing
  logDemoActions: true,
};

console.log('🧪 Demo Mode Configuration:', {
  demoMode: DEMO_MODE,
  mockPayments: demoConfig.enableMockPayments,
  mockDatabase: demoConfig.enableMockDatabase,
});
