# Test Case Document

**Project Name:** Duyanan Restaurant Online Ordering System
**Module:** Order Tracking & Fulfillment Dashboard (v1.0)
**Version:** 1.0
**Prepared By:** QA Team
**Date:** July 9, 2026

---

## Document Information

| Item             | Details                                      |
|------------------|----------------------------------------------|
| Project          | Duyanan Restaurant Online Ordering System    |
| Module           | Order Tracking & Fulfillment Dashboard (Admin & Kitchen Staff Panel) |
| Requirement IDs  | REQ-FBD-030 to REQ-FBD-032, REQ-FBD-040 to REQ-FBD-042, REQ-FBD-050 to REQ-FBD-052 |
| Prepared By      | QA Team                                      |
| Reviewed By      | QA Lead                                      |
| Version          | 1.0                                          |
| Date             | July 9, 2026                                 |

---

## Test Environment

| Item             | Value                                        |
|------------------|----------------------------------------------|
| Browser          | Google Chrome v138                           |
| Operating System | Windows 11                                   |
| API Base URL     | http://localhost:8080                        |
| Database         | MySQL – Duyanan Restaurant DB (Test Instance)|
| Tester           | QA Team                                      |

---

---

# MODULE: ORDER TRACKING & FULFILLMENT DASHBOARD

**Module Description:**
This module covers backend admin operations for tracking incoming customer orders, updating their fulfillment progress (e.g. from PENDING to PREPARING/COMPLETED), and handling order cancellation with strict textual reason validation.

---

## FEATURE 1 – VIEW INCOMING ORDERS DASHBOARD

### Requirement

**Requirement ID:** REQ-FBD-030 to REQ-FBD-032

**Description:**
The dashboard must successfully retrieve all customer orders sorted temporally from newest to oldest so staff can fulfill requests. The system must also handle cases when there are no active orders gracefully.

### Preconditions
- Admin user is authenticated with a valid Admin JWT token.
- API endpoints are active and accessible.

### Test Cases

| Test Case ID | Requirement ID | Preconditions | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-ORD-001 | REQ-FBD-030 | At least one order exists in database. | Validate that the system successfully returns the list of all orders. | 1. Send GET request to `/api/admin/orders` with admin auth header.<br>2. Parse the JSON response. | Admin JWT Token | HTTP Status 200 OK. Response body is a valid JSON array containing order objects. | High |
| TC-ORD-002 | REQ-FBD-031 | At least two orders exist with different timestamps. | Validate that the orders returned by the API are strictly ordered by `orderDate` from newest to oldest. | 1. Fetch orders from `/api/admin/orders`.<br>2. Extract the `orderDate` of index 0 and index 1.<br>3. Compare timestamps. | Multiple orders in the database with staggered timestamps (e.g., T1=10:00 AM, T2=10:15 AM) | The timestamp of Index 0 is strictly greater than or equal to Index 1 (newest first). | High |
| TC-ORD-003 | REQ-FBD-032 | Orders table in database is empty. | Validate API behavior when the database has 0 records. | 1. Truncate/Clear the Orders table.<br>2. Send GET request to `/api/admin/orders`. | A clean test database environment | HTTP Status 200 OK. Response body is literally an empty array `[]`. | Medium |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-FBD-030 | Admin dashboard can fetch all customer orders. | TC-ORD-001 |
| REQ-FBD-031 | Orders are sorted descending by order date. | TC-ORD-002 |
| REQ-FBD-032 | Graceful handling of empty orders lists. | TC-ORD-003 |

### Test Data

| Description | Value |
|---|---|
| Admin Authorization Header | `Bearer <valid_admin_jwt_token>` |
| Staggered Timestamps | T1 = 2026-07-09T10:00:00Z, T2 = 2026-07-09T10:15:00Z |
| Empty State | Database order table cleared |

---

## FEATURE 2 – UPDATE ORDER FULFILLMENT STATUS

### Requirement

**Requirement ID:** REQ-FBD-040 to REQ-FBD-042

**Description:**
The system must allow staff/admin to update an order's progress to a valid state (e.g., PREPARING, COMPLETED) while maintaining audit integrity (not wiping totals/items) and rejecting updates to non-existent orders.

### Preconditions
- Admin is authenticated.

### Test Cases

| Test Case ID | Requirement ID | Preconditions | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-STS-001 | REQ-FBD-040 | Order ID 15 exists with PENDING status. | Validate that submitting a new status successfully updates the database record. | 1. Send PUT request to `/api/admin/orders/15/status` with payload.<br>2. Check response JSON.<br>3. Send GET request to verify changes. | `orderId: 15` (existing PENDING order)<br>Payload: `{ "status": "COMPLETED" }` | Response contains message "Order status updated." and subsequent GET confirms status is "COMPLETED". | High |
| TC-STS-002 | REQ-FBD-041 | Order ID 999999 does NOT exist in database. | Validate trying to update an order ID that is not in the database. | 1. Send PUT request to `/api/admin/orders/999999/status` with payload. | `orderId: 999999` (non-existent order)<br>Payload: `{ "status": "COMPLETED" }` | HTTP Status 404 (Not Found). | High |
| TC-STS-003 | REQ-FBD-042 | Orders exist with system-defined delivery fees (₱30.00, ₱50.00, ₱80.00, or free ₱0.00). | Validate that updating the status does not accidentally wipe out the order's `totalAmount`, `items`, `orderType`, or `deliveryFee` details. | 1. Update order status.<br>2. Fetch specific order using `/api/orders/{id}`.<br>3. Validate fields. | Orders mapping to official delivery zones: Pob. (₱30), Mid (₱50), Far (₱80), or Pick-up (₱0) | Total amount, items, order type, and delivery fees remain fully intact. | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-FBD-040 | Update order status to a valid state. | TC-STS-001 |
| REQ-FBD-041 | Reject status updates for non-existent orders. | TC-STS-002 |
| REQ-FBD-042 | Retain order details (price, items) during status update. | TC-STS-003 |

### Test Data

| Description | Value |
|---|---|
| Existing Order ID | 15 (Pob. Delivery), 16 (Mid Delivery), 17 (Far Delivery), 18 (Pick-up) |
| Non-Existent Order ID | 999999 |
| Valid Status Payload | `{ "status": "COMPLETED" }` or `{ "status": "PREPARING" }` |
| Order Audit Data | <ul><li>**Pob. Delivery:** 2 items, subtotal ₱200.00, deliveryFee ₱30.00, totalAmount = ₱230.00</li><li>**Mid Delivery:** 2 items, subtotal ₱200.00, deliveryFee ₱50.00, totalAmount = ₱250.00</li><li>**Far Delivery:** 2 items, subtotal ₱200.00, deliveryFee ₱80.00, totalAmount = ₱280.00</li><li>**Pick-up / Dine-in:** 2 items, subtotal ₱200.00, deliveryFee ₱0.00, totalAmount = ₱200.00</li></ul> |

---

## FEATURE 3 – ORDER CANCELLATION & REASON VALIDATION

### Requirement

**Requirement ID:** REQ-FBD-050 to REQ-FBD-052

**Description:**
Cancelling an order requires strict validation. The system must prevent admins from cancelling an order without providing a valid, non-blank textual cancellation reason.

### Preconditions
- Admin is authenticated.

### Test Cases

| Test Case ID | Requirement ID | Preconditions | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-CAN-001 | REQ-FBD-050 | Order ID 21 exists with PENDING status. | Validate that submitting status "CANCELLED" along with a valid cancellation reason succeeds. | 1. Send PUT to update status endpoint.<br>2. Fetch order to verify database commit. | `orderId: 21`<br>Payload: `{ "status": "CANCELLED", "cancellationReason": "Out of ingredients" }` | Status is updated to "CANCELLED" and `cancellationReason` strictly matches "Out of ingredients". | High |
| TC-CAN-002 | REQ-FBD-051 | A PENDING order exists in the database. | Validate that cancelling an order without the `cancellationReason` field throws a Bad Request error. | 1. Send PUT request with status CANCELLED and no reason.<br>2. Read error structure. | Payload: `{ "status": "CANCELLED" }` | HTTP Status 400 Bad Request. Response error: "Cancellation reason is required when cancelling an order." | High |
| TC-CAN-003 | REQ-FBD-052 | A PENDING order exists in the database. | Validate that a reason string comprised entirely of empty spaces is correctly rejected. | 1. Send PUT request with whitespace string as reason. | Payload: `{ "status": "CANCELLED", "cancellationReason": "   " }` | HTTP Status 400 Bad Request (same response error as TC-CAN-002). | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-FBD-050 | Successful cancellation with reason. | TC-CAN-001 |
| REQ-FBD-051 | Block cancellation with missing reason. | TC-CAN-002 |
| REQ-FBD-052 | Reject blank or whitespace-only cancellation reasons. | TC-CAN-003 |

### Test Data

| Description | Value |
|---|---|
| Existing Order ID for Cancel | 21 |
| Valid Cancellation Reason | "Out of ingredients" |
| Blank/Whitespace Reason | `"   "` |

---

### Module Exit Criteria

Testing for the Order Tracking & Fulfillment Dashboard module is considered complete when:
- All High Priority test cases have been executed and passed.
- All status-related business rules (audit retention, cancellation reason validation) are verified.
- Error payloads for 400 Bad Request and 404 Not Found are verified against the swagger/API design.
- Test Execution Report has been compiled.

---

## Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| QA Engineer | | _______________ | _______ |
| QA Lead | | _______________ | _______ |
| Project Manager | | _______________ | _______ |

---

*End of Test Case Document – Order Tracking & Fulfillment Dashboard v1.0*
