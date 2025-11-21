declare module 'react-native-razorpay' {
  interface RazorpayCheckoutOptions {
    description?: string;
    image?: string;
    currency?: string;
    key: string;
    amount: number;
    name?: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
    method?: {
      netbanking?: boolean;
      card?: boolean;
      wallet?: boolean;
      upi?: boolean;
      emandate?: boolean;
      recurring?: boolean;
    };
    notes?: Record<string, string>;
    subscription_registration?: {
      method: string;
      auth_type: string;
      expire_at: number;
    };
    timeout?: number;
  }

  interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  interface RazorpayCheckout {
    open(options: RazorpayCheckoutOptions): Promise<RazorpayPaymentResponse>;
    PAYMENT_CANCELLED: string;
  }

  const RazorpayCheckout: RazorpayCheckout;
  export default RazorpayCheckout;
}
