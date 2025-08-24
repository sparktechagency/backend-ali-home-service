# Wallet Module

## Overview

The Wallet module manages provider financial state and transactions within the platform. It tracks provider balances, admin commissions, cash payment handling, and records provider-level transactions. This document explains the module's responsibilities, key components, interactions, and common usage patterns for developers.

---

## Table of Contents

- Purpose
- Key Components
- How components interact
- Important functions & responsibilities
- Data models and important properties
- Business rules and validations
- Examples
- Notes & next steps

---

## Purpose

- Centralize provider financial data (balances, commissions, cash payments).
- Provide transactional updates to prevent inconsistent financial state.
- Expose routes/controllers for admin and provider operations related to wallets and transactions.

---

## Key Components

- `wallet.model.ts` — Mongoose models: `Wallet` and `ProviderTransaction`.
- `wallet.service.ts` — Business logic and data access methods (transactions, aggregations).
- `wallet.controller.ts` — HTTP handlers that adapt service results to API responses.
- `wallet.route.ts` — Express routes and access control for wallet endpoints.
- `wallet.interface.ts` — (Currently minimal) placeholder for wallet-related TypeScript interfaces.

---

## How components interact

- Routes receive HTTP requests and apply authentication middleware.
- Controllers use `wallet.service` to perform business logic and return results via `sendResponse`.
- Services interact directly with Mongoose models for reads, updates, aggregations, and transactional writes.
- Models define the persistent schema for wallet and transaction documents.

---

## Important functions & responsibilities

Service methods (in `wallet.service.ts`):

- `findProviderWiseWallet(id: string)`

  - Returns the `Wallet` document for a admin (by provider id).

- `updateWallet(id: string, payload: any)`

  - Updates wallet document fields (e.g., percentage) by wallet id and returns the updated doc.

- `updateTransaction(walletId: string, data: any)`

  - Performs a transactional wallet debit and records a `ProviderTransaction`.
  - Validates that paid amount does not exceed wallet balance.
  - Updates: amount, lastPaidAmount, lastPaidDate, totalPaid.
  - Creates a `ProviderTransaction` record with remaining amount and note.
  - Uses Mongoose sessions to ensure atomicity (commit/abort patterns).

- `updateCashTransaction(walletId: string)`

  - Moves cash payment commission due into total cash commission income and zeroes the due amount.
  - Creates a `ProviderTransaction` entry of type `received` for the cash commission.
  - Runs inside a transaction session.

- `getProviderTransactions(walletId: string)` (exported as providerTransactionServices)

  - Returns provider transactions for a given wallet id, populated with provider name.

- `findTotalAdminIncome()`

  - Aggregates total `adminComission` from Wallets and `serviceFee` from Payments, returns both sums.

- `getWalletDataForprovider(providerId: string)`
  - Convenience getter that returns wallet by provider id (used by provider-facing route).

Controller responsibilities (in `wallet.controller.ts`):

- Map HTTP requests to service calls.
- Standardize responses using `sendResponse` and `catchAsync` for error handling.
- Ensure correct status codes and messages for client consumption.

Routes (in `wallet.route.ts`):

- Define endpoints and attach `auth` middleware with appropriate roles.
- Routes include:
  - GET `/` - provider wallet data (provider role or admin)
  - GET `/earning-overview` - admin income summary (admin roles)
  - PATCH `/cash/received/:id` - mark cash commission received (admin)
  - GET `/:id` - wallet by id (admin)
  - PATCH `/percentage/:id` - update wallet percentage (admin)
  - PATCH `/:id` - create a transaction/update wallet (admin)
  - Provider transaction sub-router: GET `/:id` - transactions for a wallet

---

## Data Models & Important Properties

Wallet (key fields):

| Property                        |               Type | Description                                 |
| ------------------------------- | -----------------: | ------------------------------------------- |
| provider                        | ObjectId(Provider) | Owner of wallet.                            |
| shop                            |     ObjectId(Shop) | Shop linked to wallet.                      |
| percentage                      |             Number | Platform share percentage (default 30).     |
| totalPaid                       |             Number | Cumulative amount paid out to provider.     |
| adminComission                  |             Number | Accumulated commission owed to admin.       |
| amount                          |             Number | Current wallet balance (amount available).  |
| totalCashPayment                |             Number | Cumulative cash payments handled.           |
| totalCashPaymentComissionIncome |             Number | Total cash commission earned by admin.      |
| cashPaymentComissionDue         |             Number | Commission due to admin from cash payments. |
| lastPaidAmount                  |             Number | Last paid amount recorded.                  |
| lastPaidDate                    |             String | ISO string date of last payment.            |

ProviderTransaction (key fields):

| Property        |               Type | Description                                          |
| --------------- | -----------------: | ---------------------------------------------------- | ------ | --------------------------- |
| wallet          |   ObjectId(Wallet) | Reference wallet for this transaction.               |
| provider        | ObjectId(Provider) | Provider associated with the transaction.            |
| amountPaid      |             Number | Amount involved in the transaction.                  |
| paidDate        |               Date | When the transaction was recorded.                   |
| paidVia         |      String (enum) | 'cash'                                               | 'bank' | 'mobile' - payment channel. |
| type            |      String (enum) | 'paid' or 'received' - direction of the transaction. |
| remainingAmount |             Number | Wallet balance after the transaction.                |
| note            |             String | Optional memo.                                       |

---

## Business rules & validations

- Transactions that debit the wallet must not exceed the wallet balance. The service throws `BAD_REQUEST` when attempted paid amount is greater than the balance.
- Money-affecting operations use Mongoose sessions for atomicity: update wallet, then create transaction, then commit.
- Cash commission handling separates `cashPaymentComissionDue` from `totalCashPaymentComissionIncome` until explicitly marked received.
- Endpoints are protected via role-based `auth` middleware: provider and admin roles are required where appropriate.

---

## Examples

- Update wallet transaction (debit):

Request (PATCH /wallet/:id)

```json
{
  "amountPaid": 1000,
  "note": "Payout for order #1234",
  "paidVia": "bank"
}
```

- Expected flow:

  1.  Service checks wallet balance.
  2.  Wallet.amount decreases by amountPaid.
  3.  lastPaidAmount, lastPaidDate, totalPaid updated.
  4.  ProviderTransaction created with remainingAmount.

- Mark cash commission received (PATCH /wallet/cash/received/:id)
  - Moves `cashPaymentComissionDue` to `totalCashPaymentComissionIncome` and creates a `received` transaction entry.

---

## Developer notes & next steps

- Add TypeScript interfaces in `wallet.interface.ts` to improve typings for requests and service payloads.
- Add unit tests for transactional flows (`updateTransaction`, `updateCashTransaction`) including edge cases (insufficient balance, concurrent updates).
- Consider adding optimistic concurrency (versioning) or additional checks for high-concurrency money operations.
- Address security vulnerabilities flagged by GitHub for project dependencies.

---

## Quick reference (exported service API)

- `walletServices`:

  - `findProviderWiseWallet(id)`
  - `updateTransaction(walletId, data)`
  - `updateWallet(id, payload)`
  - `findTotalAdminIncome()`
  - `updateCashTransaction(walletId)`
  - `getWalletDataForprovider(providerId)`

- `providerTransactionServices`:
  - `getProviderTransactions(walletId)`

---

If you want, I can:

- Generate TypeScript interfaces for the request/response shapes.
- Add unit tests for the core service functions.
- Create Postman/HTTP examples for each route.

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
