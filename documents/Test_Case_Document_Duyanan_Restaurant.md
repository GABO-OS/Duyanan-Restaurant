# Test Case Document

**Project Name:** Duyanan Restaurant Online Ordering System
**Module:** All Modules (v1.0)
**Version:** 1.0
**Prepared By:** QA Team
**Date:** July 9, 2026

---

## Document Information

| Item             | Details                                      |
|------------------|----------------------------------------------|
| Project          | Duyanan Restaurant Online Ordering System    |
| Modules          | User Account Management, Menu & Product Catalog, Shopping Cart & Order Placement, Order Management & History |
| Requirement IDs  | REQ-UAM-001 to REQ-UAM-003, REQ-MPC-001 to REQ-MPC-003, REQ-SCP-001 to REQ-SCP-003, REQ-OMH-001 to REQ-OMH-003 |
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
| URL              | http://localhost:5173                        |
| Database         | MySQL – Duyanan Restaurant DB (Test Instance)|
| Tester           | QA Team                                      |

---

---

# MODULE 1: USER ACCOUNT MANAGEMENT

**Module Description:**
This module handles all functionalities related to customer accounts on the Duyanan Restaurant online ordering system. It covers account creation, secure login, and profile maintenance. A valid account is required before a customer can place online orders.

---

## FEATURE 1.1 – USER REGISTRATION

### Requirement

**Requirement ID:** REQ-UAM-001

**Description:**
The system shall allow new customers to register an account using unique personal details (first name, last name, email, phone, address, and password). Registration must validate for duplicates, required fields, and notify the user upon success.

### Preconditions
- User is on the registration page.
- The email to be registered is not yet in the database.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-UAM-001 | REQ-UAM-001 | Verify that a user can register a new customer account with valid details. | 1. Navigate to registration page. 2. Enter "Maria" in First Name. 3. Enter "Santos" in Last Name. 4. Enter "maria.santos@gmail.com" in Email. 5. Enter "09123456789" in Phone. 6. Enter "123 Mango Street, Cebu City" in Address. 7. Enter "Maria@1234" in Password. 8. Click "Register". | First Name: Maria; Last Name: Santos; Email: maria.santos@gmail.com; Phone: 09123456789; Address: 123 Mango Street, Cebu City; Password: Maria@1234 | Account is created. SweetAlert2 popup: "Registration Successful! Your account has been created. Please log in." User is redirected to login page. | High |
| TC-UAM-002 | REQ-UAM-001 | Verify that registration is rejected when using an already existing email. | 1. Navigate to registration page. 2. Fill all fields using test data. 3. Click "Register". | First Name: Juan; Last Name: Dela Cruz; Email: existing@gmail.com; Phone: 09987654321; Password: Juan@5678 | Registration is rejected. Error message: "Email is already in use". User remains on registration page. | High |
| TC-UAM-003 | REQ-UAM-001 | Verify that registration fails and shows validation errors when all required fields are blank. | 1. Navigate to registration page. 2. Leave all required fields blank. 3. Click "Register". | First Name: (blank); Last Name: (blank); Email: (blank); Password: (blank) | Registration does not proceed. Inline validation errors appear. Messages include: "First name is required", "Email is required", "Password is required". | Medium |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-UAM-001 | System shall allow new users to register with valid unique personal details. | TC-UAM-001, TC-UAM-002, TC-UAM-003 |

### Test Data

| Description | Value |
|---|---|
| Valid First Name | Maria |
| Valid Last Name | Santos |
| Valid Email | maria.santos@gmail.com |
| Valid Phone | 09123456789 |
| Valid Address | 123 Mango Street, Cebu City |
| Valid Password | Maria@1234 |
| Duplicate Email | existing@gmail.com |

---

## FEATURE 1.2 – USER LOGIN / AUTHENTICATION

### Requirement

**Requirement ID:** REQ-UAM-002

**Description:**
The system shall authenticate registered customers using their email address and password. It must reject invalid credentials, non-existent emails, and incorrect passwords with appropriate error messages.

### Preconditions
- User is on the login page.
- Account "maria.santos@gmail.com" with password "Maria@1234" exists in the database.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-UAM-004 | REQ-UAM-002 | Verify that a user can successfully log in with a correct email and password. | 1. Navigate to the login page. 2. Enter "maria.santos@gmail.com" in Email. 3. Enter "Maria@1234" in Password. 4. Click "Login". | Email: maria.santos@gmail.com; Password: Maria@1234 | User is authenticated. Redirected to home/menu page. User's name "Maria" appears in the top navigation bar. | High |
| TC-UAM-005 | REQ-UAM-002 | Verify that login fails when entering a correct email with a wrong password. | 1. Navigate to the login page. 2. Enter "maria.santos@gmail.com" in Email. 3. Enter "WrongPassword99" in Password. 4. Click "Login". | Email: maria.santos@gmail.com; Password: WrongPassword99 | Login fails. Error message: "Invalid credentials". User remains on login page. | High |
| TC-UAM-006 | REQ-UAM-002 | Verify that login fails when entering a non-existent email address. | 1. Navigate to the login page. 2. Enter "ghost@email.com" in Email. 3. Enter "anyPassword123" in Password. 4. Click "Login". | Email: ghost@email.com; Password: anyPassword123 | Login fails. Error message: "No account found with this email". User remains on login page. | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-UAM-002 | System shall authenticate registered users and reject invalid credentials. | TC-UAM-004, TC-UAM-005, TC-UAM-006 |

### Test Data

| Description | Value |
|---|---|
| Valid Email | maria.santos@gmail.com |
| Valid Password | Maria@1234 |
| Wrong Password | WrongPassword99 |
| Non-Existent Email | ghost@email.com |
| Any Password (for non-existent) | anyPassword123 |

---

## FEATURE 1.3 – PROFILE MANAGEMENT

### Requirement

**Requirement ID:** REQ-UAM-003

**Description:**
The system shall allow logged-in customers to view and update their profile information including phone number and delivery address. The system must validate inputs and reject invalid formats.

### Preconditions
- User is logged in as "maria.santos@gmail.com".
- User is on the Profile page.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-UAM-007 | REQ-UAM-003 | Verify that a logged-in user can view their profile details correctly. | 1. Log in as "maria.santos@gmail.com". 2. Click on "Profile" in the navigation bar. | Active session for user ID 1 | Profile page loads correctly. User's first name, last name, email, phone, and address are all visible. | Medium |
| TC-UAM-008 | REQ-UAM-003 | Verify that a logged-in user can successfully update their phone number and delivery address. | 1. Log in and navigate to Profile page. 2. Clear the Phone field and type "09222222222". 3. Clear the Address field and type "456 Coconut Ave, Mandaue City". 4. Click "Save Changes". | Phone: 09222222222; Address: 456 Coconut Ave, Mandaue City | Profile is updated successfully. Success message: "Profile updated successfully". New phone and address are shown on the profile page. | Medium |
| TC-UAM-009 | REQ-UAM-003 | Verify that updating profile fails and shows a validation error when providing an invalid phone number. | 1. Log in and navigate to Profile page. 2. Clear the Phone field and enter "ABCD-EFGH". 3. Click "Save Changes". | Phone: ABCD-EFGH | Profile is NOT updated. Validation error: "Please enter a valid phone number". Page remains on the profile form. | Medium |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-UAM-003 | System shall allow users to view and update their profile details with validation. | TC-UAM-007, TC-UAM-008, TC-UAM-009 |

### Test Data

| Description | Value |
|---|---|
| Valid Phone | 09222222222 |
| Valid Address | 456 Coconut Ave, Mandaue City |
| Invalid Phone | ABCD-EFGH |

---

### Module 1 Exit Criteria

Testing for Module 1 (User Account Management) is considered complete when:
- All High Priority test cases have been executed.
- All Critical and High severity defects have been fixed and retested.
- No unresolved blocker defects remain.
- Test Execution Report has been completed.

---

---

# MODULE 2: MENU & PRODUCT CATALOG

**Module Description:**
This module covers how customers browse the online menu, filter products by category, view individual product details (pricing variants, flavors, descriptions), and how unavailable products are presented.

---

## FEATURE 2.1 – BROWSE MENU BY CATEGORY

### Requirement

**Requirement ID:** REQ-MPC-001

**Description:**
The system shall display the full product menu organized by category. Customers must be able to filter products by selecting a category tab, and empty categories must display an informational placeholder message.

### Preconditions
- User is on the Menu page (login not required).
- At least one product exists per available category.
- A "Seasonal" category exists with no assigned products.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-MPC-001 | REQ-MPC-001 | Verify that the menu page loads and displays all available product categories. | 1. Navigate to the Menu page from the navigation bar. 2. Observe the category tabs or filter buttons. | N/A (uses seeded product data) | All available categories are visible (e.g., Drinks, Meals, Combos). Products are grouped or filterable by category. | High |
| TC-MPC-002 | REQ-MPC-001 | Verify that products are filtered correctly when selecting the "Drinks" category. | 1. Navigate to the Menu page. 2. Click on the "Drinks" category tab or filter button. | Selected Category: Drinks | Only drink products are displayed. Products from other categories are hidden. | High |
| TC-MPC-003 | REQ-MPC-001 | Verify that a category with no active products displays an appropriate informational message. | 1. Navigate to the Menu page. 2. Click the "Seasonal" category filter. | Selected Category: Seasonal | No product cards are shown. A message appears: "No items available in this category". | Medium |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-MPC-001 | System shall display and filter menu products by category with appropriate empty-state messages. | TC-MPC-001, TC-MPC-002, TC-MPC-003 |

### Test Data

| Description | Value |
|---|---|
| Available Categories | Drinks, Meals, Combos |
| Empty Category | Seasonal |

---

## FEATURE 2.2 – VIEW PRODUCT DETAILS & VARIANTS

### Requirement

**Requirement ID:** REQ-MPC-002

**Description:**
The system shall display a detailed product modal when a product card is clicked. This modal must show the product name, description, image, and all available size variants with their respective prices. Selecting a variant must dynamically update the displayed price.

### Preconditions
- Product "Buko Lemonade" exists with Solo, 1L, 1.5L, and 2L pricing variants.
- Product "Chicken BBQ Meal" exists with only a solo price (no other variants).

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-MPC-004 | REQ-MPC-002 | Verify that the product details modal displays all available pricing and size variants for a selected item. | 1. Navigate to the Menu page. 2. Locate "Buko Lemonade" in the Drinks category. 3. Click on the product card. | Product: Buko Lemonade; Price Solo: PHP 45.00; Price 1L: PHP 120.00; Price 1.5L: PHP 170.00; Price 2L: PHP 220.00 | Product detail modal opens. Name, image, description, all price variants, and flavor options are displayed correctly. | High |
| TC-MPC-005 | REQ-MPC-002 | Verify that selecting a specific product variant correctly updates the displayed price. | 1. Open the product detail for "Buko Lemonade". 2. Click or select the "1 Liter" size option. | Selected Variant: 1 Liter; Expected Price: PHP 120.00 | The displayed price updates to PHP 120.00. The selected variant is visually highlighted. | High |
| TC-MPC-006 | REQ-MPC-002 | Verify that a product with only a solo price option is displayed correctly without other variant selectors. | 1. Navigate to the Menu page. 2. Click on "Chicken BBQ Meal". | Product: Chicken BBQ Meal; Price Solo: PHP 150.00; Other Variants: null / not set | Only the solo price option (PHP 150.00) is displayed. No 1L, 1.5L, or 2L options are shown. | Medium |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-MPC-002 | System shall display product details with all size variants and dynamically update price on selection. | TC-MPC-004, TC-MPC-005, TC-MPC-006 |

### Test Data

| Description | Value |
|---|---|
| Product (multi-variant) | Buko Lemonade |
| Price – Solo | PHP 45.00 |
| Price – 1 Liter | PHP 120.00 |
| Price – 1.5 Liter | PHP 170.00 |
| Price – 2 Liter | PHP 220.00 |
| Product (single-variant) | Chicken BBQ Meal |
| Price – Solo | PHP 150.00 |

---

## FEATURE 2.3 – OUT-OF-STOCK PRODUCT HANDLING

### Requirement

**Requirement ID:** REQ-MPC-003

**Description:**
The system shall visually indicate which products are out of stock on the menu page with a badge, and must disable or remove the "Add to Cart" button for those products to prevent invalid orders. In-stock products must have a fully active "Add to Cart" button.

### Preconditions
- Product "Ube Cheese Pie" is marked as `outOfStock = true` in the database.
- Product "Buko Lemonade" is marked as `outOfStock = false` in the database.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-MPC-007 | REQ-MPC-003 | Verify that an out-of-stock product displays a visible "Out of Stock" badge on the menu. | 1. Navigate to the Menu page. 2. Locate "Ube Cheese Pie" in the product list. | Product: Ube Cheese Pie; outOfStock: true | "Ube Cheese Pie" product card is visible. An "Out of Stock" label or badge is clearly displayed on the card. | High |
| TC-MPC-008 | REQ-MPC-003 | Verify that the "Add to Cart" option is disabled or hidden for products that are out of stock. | 1. Navigate to the Menu page. 2. Click on "Ube Cheese Pie". | Product: Ube Cheese Pie; outOfStock: true | Product detail view opens. "Add to Cart" button is grayed out (disabled) or not present. Customer cannot add the item to the cart. | High |
| TC-MPC-009 | REQ-MPC-003 | Verify that an in-stock product can be successfully added to the shopping cart. | 1. Navigate to the Menu page. 2. Click on "Buko Lemonade". | Product: Buko Lemonade; outOfStock: false | Product detail view opens. "Add to Cart" button is visible and enabled. Clicking it proceeds to add the item to the cart. | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-MPC-003 | System shall display out-of-stock badges and disable Add to Cart for unavailable products. | TC-MPC-007, TC-MPC-008, TC-MPC-009 |

### Test Data

| Description | Value |
|---|---|
| Out-of-Stock Product | Ube Cheese Pie |
| outOfStock Flag | true |
| In-Stock Product | Buko Lemonade |
| outOfStock Flag | false |

---

### Module 2 Exit Criteria

Testing for Module 2 (Menu & Product Catalog) is considered complete when:
- All High Priority test cases have been executed.
- All Critical and High severity defects have been fixed and retested.
- No unresolved blocker defects remain.
- Test Execution Report has been completed.

---

---

# MODULE 3: SHOPPING CART & ORDER PLACEMENT

**Module Description:**
This module covers the full shopping cart experience including adding items, adjusting quantities, removing products, and placing an order either for pickup at the restaurant or for delivery to a specified address.

---

## FEATURE 3.1 – ADD / REMOVE ITEMS FROM CART

### Requirement

**Requirement ID:** REQ-SCP-001

**Description:**
The system shall allow logged-in customers to add items to the cart with selected variants and quantities, update item quantities with real-time total recalculation, and remove items from the cart.

### Preconditions
- User is logged in.
- "Buko Lemonade" (Solo, PHP 45.00) is available in the menu.
- Cart contains "Buko Lemonade x2" and "Chicken BBQ Meal x1" where applicable.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SCP-001 | REQ-SCP-001 | Verify that items are successfully added to the cart with correct prices and quantities. | 1. Log in and navigate to Menu page. 2. Click on "Buko Lemonade". 3. Select "Solo" variant. 4. Set quantity to 2. 5. Click "Add to Cart". 6. Navigate to Cart page. | Product: Buko Lemonade; Variant: Solo; Price: PHP 45.00; Quantity: 2 | "Buko Lemonade (Solo) x2" is listed in the cart. Cart subtotal shows PHP 90.00. | High |
| TC-SCP-002 | REQ-SCP-001 | Verify that the quantity of a cart item can be updated and the cart subtotal recalculated. | 1. Navigate to the Cart page. 2. Locate "Buko Lemonade". 3. Click the "+" button to increase quantity from 2 to 4. | Product: Buko Lemonade; Old Quantity: 2; New Quantity: 4; Price/unit: PHP 45.00 | Quantity updates to 4. Cart subtotal updates to PHP 180.00. | High |
| TC-SCP-003 | REQ-SCP-001 | Verify that an item can be successfully removed from the shopping cart and the total amount updated. | 1. Navigate to Cart page. 2. Locate "Chicken BBQ Meal". 3. Click the "Remove" or trash icon button. 4. Confirm removal if prompted. | Item to Remove: Chicken BBQ Meal; Remaining Item: Buko Lemonade | "Chicken BBQ Meal" is removed from the cart. Only "Buko Lemonade" remains. Cart total is recalculated without "Chicken BBQ Meal". | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-SCP-001 | System shall allow customers to add, update, and remove items from the cart with dynamic total updates. | TC-SCP-001, TC-SCP-002, TC-SCP-003 |

### Test Data

| Description | Value |
|---|---|
| Product | Buko Lemonade |
| Variant | Solo |
| Unit Price | PHP 45.00 |
| Initial Quantity | 2 |
| Updated Quantity | 4 |
| Item to Remove | Chicken BBQ Meal |

---

## FEATURE 3.2 – PLACE A PICKUP ORDER

### Requirement

**Requirement ID:** REQ-SCP-002

**Description:**
The system shall allow customers to place pickup orders from the cart. It must support optional special instruction notes and block order placement when the cart is empty.

### Preconditions
- User is logged in.
- Cart contains at least one item (e.g., "Buko Lemonade (Solo) x2").
- Cart is empty (for TC-SCP-006).

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SCP-004 | REQ-SCP-002 | Verify that a customer can successfully place an order for pickup. | 1. Navigate to Cart page. 2. Select "Pickup" as order type. 3. Click "Place Order". 4. Confirm the order in confirmation dialog. | Order Type: PICKUP; Cart Items: Buko Lemonade (Solo) x2; Total: PHP 90.00 | Order is created with status "PENDING" and type "PICKUP". Success message: "Order placed successfully!". Cart is cleared. Order appears in Order History. | High |
| TC-SCP-005 | REQ-SCP-002 | Verify that a customer can successfully place a pickup order with special instructions/notes. | 1. Navigate to Cart page. 2. Select "Pickup" as order type. 3. Type "Extra rice please" in Notes field. 4. Click "Place Order" and confirm. | Order Type: PICKUP; Notes: "Extra rice please" | Order is created with type "PICKUP". The note "Extra rice please" is stored with the order. Note is visible in Order History detail view. | Medium |
| TC-SCP-006 | REQ-SCP-002 | Verify that placing an order is blocked when the shopping cart is empty. | 1. Navigate to Cart page while cart is empty. 2. Attempt to click "Place Order" or "Checkout". | N/A (empty cart) | Order is NOT placed. Message: "Your cart is empty. Please add items before ordering." User remains on cart page. | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-SCP-002 | System shall allow customers to place pickup orders with optional notes and block empty cart checkout. | TC-SCP-004, TC-SCP-005, TC-SCP-006 |

### Test Data

| Description | Value |
|---|---|
| Order Type | PICKUP |
| Cart Items | Buko Lemonade (Solo) x2 |
| Total Amount | PHP 90.00 |
| Special Notes | "Extra rice please" |
| Empty Cart | N/A |

---

## FEATURE 3.3 – PLACE A DELIVERY ORDER

### Requirement

**Requirement ID:** REQ-SCP-003

**Description:**
The system shall allow customers to place delivery orders by providing a valid delivery address. The delivery fee must be clearly itemized and included in the total. The system must block order submission if the delivery address is blank.

### Preconditions
- User is logged in.
- Cart contains "Buko Lemonade (Solo) x2" (subtotal: PHP 90.00).
- System delivery fee is PHP 50.00.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SCP-007 | REQ-SCP-003 | Verify that a customer can successfully place a delivery order with a complete delivery address. | 1. Navigate to Cart page. 2. Select "Delivery" as order type. 3. Enter "789 Sampaguita Road, Lapu-Lapu City" in delivery address field. 4. Click "Place Order" and confirm. | Order Type: DELIVERY; Address: 789 Sampaguita Road, Lapu-Lapu City; Delivery Fee: PHP 50.00; Subtotal: PHP 90.00; Total: PHP 140.00 | Order is created with type "DELIVERY". Delivery address is stored correctly. Delivery fee of PHP 50.00 is applied. Total amount is PHP 140.00. | High |
| TC-SCP-008 | REQ-SCP-003 | Verify that the system correctly includes the delivery fee in the total amount for delivery orders. | 1. Add items to cart (total: PHP 90.00). 2. Go to Cart page. 3. Select "Delivery" and enter a valid address. 4. Review order summary before confirming. | Item Subtotal: PHP 90.00; Delivery Fee: PHP 50.00; Expected Total: PHP 140.00 | Order summary displays: item subtotal PHP 90.00, delivery fee PHP 50.00 as separate line, grand total PHP 140.00. Order record stores totalAmount = 140.00. | High |
| TC-SCP-009 | REQ-SCP-003 | Verify that placing a delivery order fails when the delivery address is blank. | 1. Navigate to Cart page. 2. Select "Delivery" as order type. 3. Leave delivery address field empty. 4. Click "Place Order". | Order Type: DELIVERY; Delivery Address: (blank) | Order is NOT placed. Validation error: "Delivery address is required". User remains on the cart/checkout page. | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-SCP-003 | System shall allow delivery orders with valid address, apply delivery fee to total, and block blank addresses. | TC-SCP-007, TC-SCP-008, TC-SCP-009 |

### Test Data

| Description | Value |
|---|---|
| Order Type | DELIVERY |
| Delivery Address | 789 Sampaguita Road, Lapu-Lapu City |
| Item Subtotal | PHP 90.00 |
| Delivery Fee | PHP 50.00 |
| Grand Total | PHP 140.00 |
| Blank Address | (blank) |

---

### Module 3 Exit Criteria

Testing for Module 3 (Shopping Cart & Order Placement) is considered complete when:
- All High Priority test cases have been executed.
- All Critical and High severity defects have been fixed and retested.
- No unresolved blocker defects remain.
- Test Execution Report has been completed.

---

---

# MODULE 4: ORDER MANAGEMENT & HISTORY

**Module Description:**
This module covers how customers view and manage their online orders after placement. It includes order status tracking, order cancellation, and submitting feedback and star ratings for completed orders.

---

## FEATURE 4.1 – VIEW ORDER HISTORY & TRACK ORDER STATUS

### Requirement

**Requirement ID:** REQ-OMH-001

**Description:**
The system shall allow logged-in customers to access a full list of their past and current orders. Each order must display its ID, date, status, total, and type. Status updates made by the admin must reflect in the customer's order history view.

### Preconditions
- User is logged in with at least 2 placed orders (IDs 101 and 102).
- Order #101 has status "PENDING".
- Order #102 is a completed delivery order.

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-OMH-001 | REQ-OMH-001 | Verify that a customer can view a list of all their past and current orders on the order history page. | 1. Log in with the customer account. 2. Navigate to "Profile" > "My Orders" or the Order History section. | User account with order IDs 101 and 102 | A list of all placed orders is displayed. Each order shows: order ID, date placed, status, total amount, and order type (PICKUP or DELIVERY). | High |
| TC-OMH-002 | REQ-OMH-001 | Verify that order status updates made by the administrator are reflected correctly for the customer. | 1. Log in as customer, note Order #101 shows "PENDING". 2. Admin logs in and updates Order #101 status to "PREPARING". 3. Customer refreshes Order History page. | Order ID: 101; Old Status: PENDING; New Status: PREPARING | Order #101 now displays status "PREPARING". The status badge or label is updated correctly. | High |
| TC-OMH-003 | REQ-OMH-001 | Verify that a customer can view the full details of a specific order including items, quantities, and totals. | 1. Navigate to Order History. 2. Click on Order #102 to open its detail view. | Order ID: 102; Order Type: DELIVERY; Address: 789 Sampaguita Road, Lapu-Lapu City; Items: Buko Lemonade x2, Chicken BBQ Meal x1; Total: PHP 290.00 | Order detail page/modal opens. Items listed: Buko Lemonade x2 and Chicken BBQ Meal x1. Delivery address and total amount are displayed correctly. | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-OMH-001 | System shall display complete order history with status tracking and full order detail view. | TC-OMH-001, TC-OMH-002, TC-OMH-003 |

### Test Data

| Description | Value |
|---|---|
| Order ID (list test) | 101, 102 |
| Order #101 Old Status | PENDING |
| Order #101 New Status | PREPARING |
| Order #102 Type | DELIVERY |
| Order #102 Delivery Address | 789 Sampaguita Road, Lapu-Lapu City |
| Order #102 Items | Buko Lemonade x2, Chicken BBQ Meal x1 |
| Order #102 Total | PHP 290.00 |

---

## FEATURE 4.2 – CANCEL AN ORDER

### Requirement

**Requirement ID:** REQ-OMH-002

**Description:**
The system shall allow customers to cancel only their "PENDING" orders by providing a mandatory cancellation reason. Orders with a status of "PREPARING" or beyond must not be cancellable. Submitting a cancellation without a reason must be blocked with a validation error.

### Preconditions
- Order #103 exists with status "PENDING".
- Order #104 exists with status "PREPARING".
- Order #105 exists with status "PENDING".

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-OMH-004 | REQ-OMH-002 | Verify that a customer can cancel a pending order by providing a valid cancellation reason. | 1. Navigate to Order History and locate Order #103 (PENDING). 2. Click "Cancel Order". 3. Enter "Changed my mind" in the reason field. 4. Click "Confirm Cancellation". | Order ID: 103; Cancellation Reason: "Changed my mind" | Order #103 status changes to "CANCELLED". Reason "Changed my mind" is saved in the database. Success message: "Your order has been cancelled". | High |
| TC-OMH-005 | REQ-OMH-002 | Verify that a customer cannot cancel an order that is already being prepared. | 1. Navigate to Order History. 2. Locate Order #104 (PREPARING). 3. Attempt to click "Cancel Order". | Order ID: 104; Status: PREPARING | Cancellation is blocked. Message: "This order can no longer be cancelled". Order status remains "PREPARING". | High |
| TC-OMH-006 | REQ-OMH-002 | Verify that cancelling a pending order fails when no cancellation reason is provided. | 1. Navigate to Order History and locate Order #105 (PENDING). 2. Click "Cancel Order". 3. Leave the reason field blank. 4. Click "Confirm Cancellation". | Order ID: 105; Cancellation Reason: (blank) | Cancellation does NOT proceed. Validation error: "Please provide a reason for cancellation". Order status remains "PENDING". | High |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-OMH-002 | System shall allow cancellation of PENDING orders with a required reason and block non-cancellable orders. | TC-OMH-004, TC-OMH-005, TC-OMH-006 |

### Test Data

| Description | Value |
|---|---|
| Cancellable Order ID | 103 |
| Cancellation Reason | "Changed my mind" |
| Non-Cancellable Order ID | 104 |
| Non-Cancellable Status | PREPARING |
| Empty Reason Order ID | 105 |
| Cancellation Reason | (blank) |

---

## FEATURE 4.3 – SUBMIT ORDER FEEDBACK & RATING

### Requirement

**Requirement ID:** REQ-OMH-003

**Description:**
The system shall allow customers to submit a 1–5 star rating and a written comment for completed orders. Each order may only receive one feedback submission. The comment field is mandatory; submitting without one must display a validation error.

### Preconditions
- Order #106 exists with status "COMPLETED" and no prior feedback.
- Order #107 exists with status "COMPLETED" and no prior feedback.
- Feedback for Order #106 has been submitted (for TC-OMH-008).

### Test Cases

| Test Case ID | Requirement ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-OMH-007 | REQ-OMH-003 | Verify that a customer can successfully submit a rating and comment for a completed order. | 1. Log in and navigate to Order History. 2. Locate Order #106 (COMPLETED). 3. Click "Leave Feedback". 4. Select 5 stars. 5. Type the comment. 6. Click "Submit Feedback". | Order ID: 106; Rating: 5 stars; Comment: "The food was amazing and delivery was super fast!" | Feedback is saved and linked to Order #106. Success message: "Thank you for your feedback!". "Leave Feedback" button is replaced by "Feedback Submitted". | High |
| TC-OMH-008 | REQ-OMH-003 | Verify that the system prevents submitting duplicate feedback for the same completed order. | 1. Log in and navigate to Order History. 2. Locate Order #106 (COMPLETED, feedback already submitted). 3. Attempt to click "Leave Feedback". | Order ID: 106; Rating: 3 stars; Comment: "Trying to submit again" | System prevents second feedback submission. Message: "Feedback already submitted for this order". Or the feedback button is disabled/absent. | High |
| TC-OMH-009 | REQ-OMH-003 | Verify that submitting feedback fails when the comment field is left blank. | 1. Navigate to Order #107 feedback form. 2. Select 4 stars. 3. Leave the comment field blank. 4. Click "Submit Feedback". | Order ID: 107; Rating: 4 stars; Comment: (blank) | Feedback is NOT submitted. Validation error: "Comment is required". The feedback form remains open. | Medium |

### Traceability Matrix

| Requirement ID | Description | Test Cases |
|---|---|---|
| REQ-OMH-003 | System shall allow one-time feedback submission with rating and required comment for completed orders. | TC-OMH-007, TC-OMH-008, TC-OMH-009 |

### Test Data

| Description | Value |
|---|---|
| Feedback Order ID | 106 |
| Rating | 5 stars |
| Comment | "The food was amazing and delivery was super fast!" |
| Duplicate Test Order ID | 106 |
| Empty Comment Order ID | 107 |
| Rating (empty comment test) | 4 stars |
| Comment | (blank) |

---

### Module 4 Exit Criteria

Testing for Module 4 (Order Management & History) is considered complete when:
- All High Priority test cases have been executed.
- All Critical and High severity defects have been fixed and retested.
- No unresolved blocker defects remain.
- Test Execution Report has been completed.

---

---

# Overall Test Case Summary

| Test Case ID | Module | Test Scenario |
|---|---|---|
| TC-UAM-001 | Module 1 | Verify registration with valid details |
| TC-UAM-002 | Module 1 | Verify duplicate email registration is rejected |
| TC-UAM-003 | Module 1 | Verify blank registration fields trigger errors |
| TC-UAM-004 | Module 1 | Verify login with correct email and password |
| TC-UAM-005 | Module 1 | Verify login fails with incorrect password |
| TC-UAM-006 | Module 1 | Verify login fails with non-existent email |
| TC-UAM-007 | Module 1 | Verify logged-in user can view profile details |
| TC-UAM-008 | Module 1 | Verify profile phone and address update |
| TC-UAM-009 | Module 1 | Verify invalid phone profile update is blocked |
| TC-MPC-001 | Module 2 | Verify menu page displays all categories |
| TC-MPC-002 | Module 2 | Verify filtering products by selected category |
| TC-MPC-003 | Module 2 | Verify empty category displays informational message |
| TC-MPC-004 | Module 2 | Verify details page shows size variants and prices |
| TC-MPC-005 | Module 2 | Verify selecting variant updates active price |
| TC-MPC-006 | Module 2 | Verify single-priced product displays correct UI |
| TC-MPC-007 | Module 2 | Verify out-of-stock badge on catalog products |
| TC-MPC-008 | Module 2 | Verify Add to Cart is disabled for out-of-stock products |
| TC-MPC-009 | Module 2 | Verify adding in-stock product to cart |
| TC-SCP-001 | Module 3 | Verify adding product to cart with chosen quantity |
| TC-SCP-002 | Module 3 | Verify updating cart item quantity updates total |
| TC-SCP-003 | Module 3 | Verify removing item from cart recalculates total |
| TC-SCP-004 | Module 3 | Verify placing a pickup order successfully |
| TC-SCP-005 | Module 3 | Verify placing pickup order with special notes |
| TC-SCP-006 | Module 3 | Verify empty cart blocks order placement |
| TC-SCP-007 | Module 3 | Verify placing delivery order with valid address |
| TC-SCP-008 | Module 3 | Verify delivery fee inclusion in order total |
| TC-SCP-009 | Module 3 | Verify empty delivery address blocks order placement |
| TC-OMH-001 | Module 4 | Verify viewing all customer order history |
| TC-OMH-002 | Module 4 | Verify order status updates reflect admin changes |
| TC-OMH-003 | Module 4 | Verify viewing full single order details |
| TC-OMH-004 | Module 4 | Verify cancelling pending order with reason |
| TC-OMH-005 | Module 4 | Verify preparing order cannot be cancelled |
| TC-OMH-006 | Module 4 | Verify empty cancellation reason blocks action |
| TC-OMH-007 | Module 4 | Verify submitting star rating and review comment |
| TC-OMH-008 | Module 4 | Verify duplicate feedback submission is blocked |
| TC-OMH-009 | Module 4 | Verify empty comment blocks feedback submission |

**Total Test Cases: 36 (9 per module)**

---

## Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| QA Engineer | | _______________ | _______ |
| QA Lead | | _______________ | _______ |
| Project Manager | | _______________ | _______ |

---

*End of Test Case Document – Duyanan Restaurant Online Ordering System v1.0*
