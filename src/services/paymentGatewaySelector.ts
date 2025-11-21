export const paymentGatewaySelector = {
  selectGateway(countryCode: string): 'stripe' | 'razorpay' {
    if (countryCode === 'IN') {
      return 'razorpay'
    }
    return 'stripe'
  },

  getGatewayInfo(gateway: 'stripe' | 'razorpay') {
    if (gateway === 'razorpay') {
      return {
        name: 'Razorpay',
        methods: ['UPI', 'Cards', 'Net Banking', 'Wallets'],
        description: 'UPI, Cards, Net Banking, Digital Wallets',
        icon: 'razorpay',
      }
    }

    return {
      name: 'Stripe',
      methods: ['Cards', 'Apple Pay', 'Google Pay'],
      description: 'Credit/Debit Cards, Apple Pay, Google Pay',
      icon: 'stripe',
    }
  },
}
