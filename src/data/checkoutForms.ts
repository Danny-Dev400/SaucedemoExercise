import type { CheckoutFormData } from '../models/CheckoutForm';

export const checkoutForms: Record<string, CheckoutFormData> = {
  standard: {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345',
  },
  alternate: {
    firstName: 'Jane',
    lastName: 'Smith',
    postalCode: '90210',
  },
};
