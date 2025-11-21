// This file is deprecated - use paymentWrapper.ts instead
export const useRazorpayPayment = () => {
  return {
    createPayment: async () => ({
      success: false,
      error: 'Use processPayment from paymentWrapper instead',
    }),
  };
};
