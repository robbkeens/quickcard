/**
 * Represents payment options.
 */
export type PaymentOption = 'Mpesa' | 'Airtel Money' | 'PayPal';

/**
 * Represents the result of a payment processing attempt.
 */
export interface PaymentResult {
  /**
   * Indicates whether the payment was successful.
   */
  success: boolean;
  /**
   * A message providing details about the payment attempt.
   */
  message: string;
  /**
   * The reference number for the payment.
   */
  reference?: string;
}

/**
 * Processes a payment using the specified payment option.
 *
 * @param amount The amount to be paid.
 * @param paymentOption The payment option to use (e.g., 'Mpesa', 'Airtel Money', 'PayPal').
 * @param additionalInfo Any additional information required for the payment option.
 * @returns A promise that resolves to a PaymentResult object indicating the success or failure of the payment.
 */
export async function processPayment(
  amount: number,
  paymentOption: PaymentOption,
  additionalInfo?: any
): Promise<PaymentResult> {
  // TODO: Implement this by calling an API.

  return {
    success: true,
    message: `Successfully processed ${amount} via ${paymentOption}.`,
    reference: 'stubbed-payment-reference',
  };
}
