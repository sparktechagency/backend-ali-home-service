# Payment Model

This section explains how provider earnings and admin commissions are calculated in the payment model.

---

## Key Fields

1. **`amount`**

   - Total service amount that the provider should receive from the admin.
   - Represents the **full price of the service**.

2. **`totalCashPayment`**

   - Amount the provider actually earns.
   - Calculated as the total service amount minus the admin commission.

3. **`cashPaymentAdminCommissionDue`**
   - Commission that the provider needs to pay to the admin.
   - Calculated as the difference between the total service amount and the provider’s earnings.

---

## Example

| Field                           | Value | Description                             |
| ------------------------------- | ----- | --------------------------------------- |
| `amount`                        | 1000  | Total service price                     |
| `cashPaymentAdminCommissionDue` | 200   | Admin commission to be paid by provider |
| `totalCashPayment`              | 800   | Provider’s actual earnings              |

**Explanation:**

- The provider performed a service worth 1000 units.
- The admin takes 200 units as commission.
- The provider receives 800 units as actual earnings.
