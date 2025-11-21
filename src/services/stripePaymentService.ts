// This file is deprecated - use paymentWrapper.ts instead
export const useStripePayment = () => {
  return {
    createPayment: async () => ({
      success: false,
      error: 'Use processPayment from paymentWrapper instead',
    }),
  };
};
