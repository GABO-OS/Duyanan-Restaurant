# Test Execution Report
**Module:** Order Tracking & Fulfillment Dashboard (Admin Panel)

---

## Project Information

| Field | Value |
| :--- | :--- |
| **Project Name** | Duyanan Online Ordering System |
| **Module** | Order Tracking & Fulfillment Dashboard |
| **Test Cycle** | Cycle 1 |
| **Test Environment** | QA Environment |
| **Browser** | Google Chrome v138 |
| **Operating System** | Windows 11 |
| **Tester** | Gabriel S. Abordo |
| **Test Execution Date** | July 13, 2026 |
| **Build Version** | v1.0.0 |

---

## Execution Summary

| Metric | Count / Rate |
| :--- | :--- |
| **Total Test Cases** | 9 |
| **Executed** | 9 |
| **Passed** | 8 |
| **Failed** | 1 |
| **Blocked** | 0 |
| **Not Executed** | 0 |
| **Pass Rate** | 88.89% |
| **Fail Rate** | 11.11% |

---

## Test Case Execution Details

| Test Case ID | Test Scenario | Expected Result | Actual Result | Status | Defect ID | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ORD-028** | Validate that the orders tab loads and displays all customer orders with correct columns and stat boxes. | Active Orders dashboard loads with stat boxes, correct table columns, and order data populated (API returns 200 OK). | Active Orders dashboard loaded successfully. The columns `Order ID`, `Customer Info`, `Items`, `Timestamp`, `Price`, `Status`, and `Action` displayed correct data. Stat boxes showed correct active orders count. | **PASSED** | None | Verified by screenshot showing active orders. |
| **TC-ORD-029** | Validate that orders are sorted by timestamp from newest to oldest. | Orders in the table are sorted chronologically from newest to oldest. | Orders displayed in the table are sorted chronologically in descending order (Order #4 at 9:29:35 PM down to Order #1 at 9:26:41 PM). | **PASSED** | None | Verified by sorting order in screenshots. |
| **TC-ORD-030** | Validate the empty state behavior when no orders exist in the database. | Table shows "No active orders." message, stat boxes show 0, and API returns 200 OK with empty array `[]`. | When database orders table was truncated, stat boxes displayed `0`, the table displayed `"No active orders."`, and the GET API call returned `200 OK` with an empty array. | **PASSED** | None | Verified empty state UI and API log. |
| **TC-STS-031** | Validate that the Action dropdown successfully updates an order's status in the database and on the UI. | Order status updates to "COMPLETED" on UI and database, and "Status Updated" success toast appears. | Selecting "Completed" from the Action dropdown updated the status to "COMPLETED" on the UI and in the database. A "Status Updated" toast appeared. | **PASSED** | None | Verified via DB view and toast notification. |
| **TC-STS-032** | Validate that updating a non-existent order returns HTTP 404 Not Found. | API returns HTTP 404 Not Found, and UI displays SweetAlert2 error modal. | API returned HTTP 404. However, the frontend threw `SyntaxError: Unexpected token 'N', "Not Found" is not valid JSON` when attempting to parse the response, crashing the script and blocking the SweetAlert2 error modal from rendering. | **FAILED** | [DEF-STS-001](#defect-details) | API error response formatting issue and lack of error handling. |
| **TC-STS-033** | Validate that a status update does not alter the order's existing items, total amount, or its order type/destination delivery fee details. | All order statuses update to "PREPARING" successfully. All items, total amounts, and delivery/destination fee mappings remain unchanged. | Pricing calculations and fee mappings remain intact. Screenshot evidence displays all orders successfully updated to PREPARING status. | **PASSED** | None | Verified that order items, pricing totals, and delivery fee mapping integrity are preserved under the PREPARING status. |
| **TC-CAN-034** | Validate that a valid cancellation reason successfully cancels the order and stores the reason. | Order status updates to "CANCELLED" showing reason on UI row, success toast shows, and reason is saved in database. | Entering "Out of ingredients" and confirming successfully updated status to "CANCELLED", displayed the reason in the row, and saved the record in the database. | **PASSED** | None | Verified via UI cancel workflow. |
| **TC-CAN-035** | Validate that a missing cancellation reason blocks the cancellation with a validation error. | Cancellation is blocked, displaying "You must provide a cancellation reason!" validation error, with no API request sent. | Leaving the textarea empty blocked submission. The modal stayed open and displayed the required validation error message. | **PASSED** | None | Verified validation popup behavior. |
| **TC-CAN-036** | Validate that a whitespace-only cancellation reason is rejected identically to an empty input. | Cancellation is blocked, displaying "You must provide a cancellation reason!" validation error, with no API request sent. | Entering spaces only blocked submission and displayed the same validation message. | **PASSED** | None | Verified trim-validation rule. |

---

## Defects Found {#defect-details}

| Defect ID | Related Test Case | Summary | Severity | Priority | Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-STS-001** | TC-STS-032 | Uncaught JSON parsing syntax error on 404 API error response, blocking UI error modal. | **Medium** | **Medium** | **Open** | The backend status update API returns `404 Not Found` as plain text (empty response) instead of a JSON object. Calling `res.json()` on the frontend throws a SyntaxError, causing a crash and preventing the SweetAlert2 modal from appearing. The frontend also lacks `!res.ok` handling for non-cancel updates. |

---

## Screenshots/Evidence Summary

| Test Case | Screenshot / Evidence Provided | Description |
| :--- | :--- | :--- |
| **TC-ORD-028** | Active Orders grid panel showing 4 orders | Verifies that the Orders tab loads and renders the active order cards at the top and the orders table with all fields populated. |
| **TC-ORD-029** | Crop of Order ID, Customer Info, Items, and Timestamps | Confirms that orders are listed chronologically in descending order by timestamp (9:29:35 PM, 9:28:44 PM, 9:27:58 PM, 9:26:41 PM). |
| **TC-ORD-030** | Empty state view + Chrome DevTools Network response | Shows that the table displays "No active orders." when empty, and the GET request to `/api/admin/orders` returns `200 OK` with an empty array `[]`. |
| **TC-STS-031** | Customer track status page + phpMyAdmin view + Admin status toast | Compiles proof of a status update: shows customer tracker updated to "Completed", database record set to `'COMPLETED'`, and the admin panel displaying the "Status Updated" success toast. |
| **TC-STS-032** | Fetch script output in console returning status 404 | Shows that calling the status update API for order `999999` returns `404`, but triggers an uncaught JavaScript Promise rejection syntax error in console due to parsing non-JSON output. |
| **TC-STS-033** | Active Orders grid panel in Preparing Status | Shows that status transitioned to PREPARING for all orders while preserving items, subtotals, and delivery fees. |
| **TC-CAN-034** | SweetAlert2 Cancellation reason modal + Admin list with cancelled order | Shows "Cancellation Reason Required" input modal with reason "Out of ingredients" inputted, and background order list showing Order #2 status updated to "Cancelled". |
| **TC-CAN-035** | SweetAlert2 validation modal with empty text | Displays validation error message *"You must provide a cancellation reason!"* below the empty textarea. |
| **TC-CAN-036** | SweetAlert2 validation modal with space input | Displays the same validation message *"You must provide a cancellation reason!"* when spaces are inputted. |

---

## Test Coverage

| Requirement ID | Description | Test Cases | Status |
| :--- | :--- | :--- | :--- |
| **REQ-FDF-030 TO REQ-FDF-032** | View and loading of incoming customer orders, chronological sorting (descending), and graceful empty state dashboard rendering. | TC-ORD-028, TC-ORD-029, TC-ORD-030 | **PASSED** |
| **REQ-FDF-040 TO REQ-FDF-042** | Update order fulfillment status, reject non-existent orders, and ensure status changes preserve total amount, items, and delivery fee integrity. | TC-STS-031, TC-STS-032, TC-STS-033 | **FAILED** (due to TC-STS-032) |
| **REQ-FDF-050 TO REQ-FDF-052** | Mandatory reason validation for order cancellations, rejecting blank/whitespace-only strings, and database persistence. | TC-CAN-034, TC-CAN-035, TC-CAN-036 | **PASSED** |

---

## Test Environment

* **Application URL:** `http://localhost:5173/admin`
* **Database:** MySQL – `duyanan_db` (Local Test Instance)
* **Browser:** Google Chrome v138
* **Operating System:** Windows 11
* **Internet Connection:** Stable

---

## Risks Identified

1. **Uncaught Front-End Exceptions on Non-JSON Errors**
   * **Impact:** **High** — If the API fails and returns a non-JSON status page (like a plain text 404 or a 500 HTML page), the frontend app crashes due to uncaught promise rejections on `response.json()`.
   * **Recommendation:** Wrap response parsing in `try-catch` blocks and verify the response `Content-Type` header before parsing.
2. **Missing Failure State in Status Dropdowns**
   * **Impact:** **Medium** — The frontend `handleUpdateStatus` function currently does not catch status update failures (no `else` condition for `!res.ok`). If the database update fails on the backend, the UI dropdown remains in the updated state, misleading the user.
   * **Recommendation:** Implement rollback logic that reverts the dropdown status value and pops up a SweetAlert2 error modal if `res.ok` is false.

---

## Recommendations

1. **Standardize Backend Error Payloads:** Ensure the Spring Boot backend (`AdminController.java`) returns standard JSON objects for all error scenarios (e.g. `ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Order not found"))`) instead of returning empty `notFound()` payloads.
2. **Implement Safe JSON Helper in Frontend:** Write a utility method to read responses safely:
   ```javascript
   const errorData = res.headers.get('content-type')?.includes('application/json')
       ? await res.json().catch(() => ({}))
       : {};
   ```
3. **Add Rollback Logic on UI Status Failure:** Modify the dropdown's status update handler on the admin panel to refresh/fetch updated data when an API error occurs, reverting the dropdown to its database state.
4. **Implement Automated End-to-End Tests:** Set up automated Cypress or Playwright test suites to run through the order fulfillment status flow and empty states. This ensures validation constraints cannot be broken during releases.
