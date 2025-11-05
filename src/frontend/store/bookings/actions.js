import { Loading } from "quasar";
import axios from "axios";

// Use a mock payment endpoint or your actual test endpoint
const paymentEndpoint = process.env.VUE_APP_PAYMENT_URL || "https://your-mock-payment-api.com/charge";

/**
 * Process test payment - uses Stripe test mode
 */
export async function processPayment({
  paymentToken,
  outboundFlight,
  customerEmail
}) {
  console.group("store/bookings/actions/processPayment");
  Loading.show({
    message: "Processing test payment..."
  });

  if (!paymentToken) throw "Invalid payment token";

  const chargeData = {
    amount: outboundFlight.ticketPrice,
    currency: "usd",
    stripeToken: paymentToken.id, // Test token from Stripe.js
    description: `Test payment by ${customerEmail}`,
    email: customerEmail,
    test_mode: true // Flag for test mode
  };

  console.log("Test charge data:", chargeData);
  
  try {
    // For demo, you can use a mock response or actual Stripe test API
    const data = await axios.post(paymentEndpoint, chargeData);
    
    // If using mock endpoint, simulate success
    const chargeId = data.data?.id || `ch_test_${Date.now()}`;
    
    Loading.show({
      message: "Test payment authorized successfully..."
    });

    console.groupEnd();
    return chargeId;
  } catch (err) {
    console.error("Test payment error:", err);
    
    // For demo, you can simulate successful test payment
    if (process.env.NODE_ENV === "development") {
      console.log("Simulating successful test payment for demo");
      Loading.hide();
      return `ch_test_demo_${Date.now()}`;
    }
    
    throw err;
  }
}
