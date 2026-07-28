# BuggyShop QA Practice – Complete Test Case Suite

> **Application:** BuggyShop — Single-page e-commerce (HTML + CSS + JS vanilla)
> **Environment:** Frontend only, no server, no database
> **Total Test Cases:** 165

---

## Table of Contents

1. [Functional Test Cases (TC#001–TC#040)](#1-functional-test-cases)
2. [Negative Test Cases (TC#041–TC#070)](#2-negative-test-cases)
3. [Boundary Test Cases (TC#071–TC#085)](#3-boundary-test-cases)
4. [UI Test Cases (TC#086–TC#105)](#4-ui-test-cases)
5. [Accessibility Test Cases (TC#106–TC#120)](#5-accessibility-test-cases)
6. [Cross-browser Test Cases (TC#121–TC#130)](#6-cross-browser-test-cases)
7. [Performance Test Scenarios (TC#131–TC#140)](#7-performance-test-scenarios)
8. [Security Test Scenarios (TC#141–TC#150)](#8-security-test-scenarios)
9. [Regression Suite (TC#151–TC#155)](#9-regression-suite)
10. [Smoke Suite (TC#156–TC#160)](#10-smoke-suite)
11. [Sanity Suite (TC#161–TC#165)](#11-sanity-suite)

---

## 1. Functional Test Cases

| ID | Title | Precondition | Steps | Expected Result | Actual Result (Current) |
|----|-------|-------------|-------|-----------------|-------------------------|
| TC001 | Verify page loads successfully | Browser open, URL accessible | 1. Navigate to BuggyShop URL<br>2. Observe page | Page loads with header "BuggyShop", product grid, search bar, cart section | Pass |
| TC002 | Verify all 6 products render on page load | Fresh page load | 1. Open BuggyShop<br>2. Count product cards in grid | Exactly 6 product cards displayed (iPhone 15, Samsung S24, MacBook Air, Gaming Mouse, Mechanical Keyboard, Sony Headphones) | Pass |
| TC003 | Verify product names are displayed correctly | Products rendered | 1. Observe each card's name | Names: "iPhone 15", "Samsung S24", "MacBook Air", "Gaming Mouse", "Mechanical Keyboard", "Sony Headphones" | Pass |
| TC004 | Verify product prices are displayed correctly | Products rendered | 1. Observe each card's price | Prices: ₹70000, ₹65000, ₹98000, ₹1500, ₹3500, ₹6000 | Pass |
| TC005 | Verify product stock levels are displayed | Products rendered | 1. Observe each card's stock text | Stock: 5, 0, 2, 10, 4, 3 | Pass |
| TC006 | Verify product images are loaded | Products rendered, internet available | 1. Observe images on cards | Each card shows an image from picsum.photos | Pass |
| TC007 | Verify "Add to Cart" button is present on every card | Products rendered | 1. Check each product card | Every card has an "Add to Cart" button | Pass |
| TC008 | Verify clicking "Add to Cart" adds item to cart | Products rendered | 1. Click "Add to Cart" on iPhone 15 | iPhone 15 appears in the Shopping Cart section | Pass |
| TC009 | Verify cart count badge increments on add | Cart previously empty | 1. Click "Add to Cart" on iPhone 15<br>2. Observe badge | Cart badge (count) changes from "0" to "1" | Pass |
| TC010 | Verify cart total updates after adding item | Cart previously empty | 1. Click "Add to Cart" on Gaming Mouse (₹1500)<br>2. Observe total | Total = ₹1400 (₹1500 - ₹100 bug) | Defect: Total incorrectly shows ₹1400 instead of ₹1500 |
| TC011 | Verify cart shows all added items | Multiple items added | 1. Add iPhone 15 to cart<br>2. Add MacBook Air to cart | Both iPhone 15 and MacBook Air appear in cart list | Pass |
| TC012 | Verify adding same product multiple times adds duplicate entries | Products rendered | 1. Click "Add to Cart" on iPhone 15 twice | iPhone 15 appears twice in cart list (no merging) | Defect: Duplicate entries not merged; no quantity counter |
| TC013 | Verify search filters products by name | Products rendered | 1. Type "iPhone" in search box<br>2. Observe grid | Only iPhone 15 card displayed | Pass |
| TC014 | Verify search is case-sensitive | Products rendered | 1. Type "iphone" (lowercase) in search box<br>2. Observe grid | No products displayed (case-sensitive bug) | Defect: Search should be case-insensitive |
| TC015 | Verify empty search returns all products | Products rendered, previous search active | 1. Type something in search<br>2. Clear search box to empty string<br>3. Observe grid | All 6 products reappear | Pass |
| TC016 | Verify cart initial state shows 0 items | Fresh page load | 1. Open page<br>2. Check cart section | Cart shows empty with no items; total = ₹0 | Pass |
| TC017 | Verify total displays in Indian Rupee format | Item added to cart | 1. Add iPhone 15 (₹70000) to cart<br>2. Observe total | Total shows "Total : ₹69900" (₹70000 - ₹100 bug) | Defect: Total miscalculated by ₹100 |
| TC018 | Verify cart persists while page is not refreshed | Item added to cart | 1. Add item to cart<br>2. Scroll away and back | Cart still shows the item | Pass |
| TC019 | Verify out-of-stock item (Samsung S24, stock=0) has "Add to Cart" button | Products rendered | 1. Observe Samsung S24 card | "Add to Cart" button is present and clickable | Defect: Button should be disabled for out-of-stock items |
| TC020 | Verify out-of-stock item can be added to cart | Products rendered | 1. Click "Add to Cart" on Samsung S24 (stock=0) | Samsung S24 is added to cart despite 0 stock | Defect: Out-of-stock validation missing |
| TC021 | Verify stock display updates if stock is 0 | Products rendered | 1. Observe Samsung S24 card | Shows "Stock : 0" in gray text | Pass |
| TC022 | Verify header contains "BuggyShop" and cart count | Fresh page load | 1. Observe header | Header shows "🛒 BuggyShop" on left, "Cart : 0" with badge on right | Pass |
| TC023 | Verify footer text is displayed | Fresh page load | 1. Scroll to bottom | Footer shows "BuggyShop QA Practice Website" | Pass |
| TC024 | Verify search input placeholder | Page loaded | 1. Observe search input | Placeholder shows "Search Products..." | Pass |
| TC025 | Verify adding high-value item (MacBook Air ₹98000) | Page loaded | 1. Add MacBook Air to cart<br>2. Check total | MacBook Air appears in cart; Total = ₹97900 (₹98000 - ₹100 bug) | Defect: Total off by ₹100 |
| TC026 | Verify adding low-value item (Gaming Mouse ₹1500) | Page loaded | 1. Add Gaming Mouse to cart<br>2. Check total | Gaming Mouse appears; Total = ₹1400 (₹1500 - ₹100 bug) | Defect: Total off by ₹100 |
| TC027 | Verify search with partial product name | Products rendered | 1. Type "Samsung" in search<br>2. Observe | Samsung S24 card shown | Pass |
| TC028 | Verify search with single character | Products rendered | 1. Type "i" in search<br>2. Observe | iPhone 15 card shown (model name contains "i") | Pass |
| TC029 | Verify cart total with multiple items | Cart empty | 1. Add Gaming Mouse (₹1500)<br>2. Add Keyboard (₹3500)<br>3. Check total | Total = ₹4900 (₹1500+₹3500-₹100) | Defect: Total = ₹4900 instead of ₹5000 |
| TC030 | Verify cart total with three items | Cart empty | 1. Add iPhone 15 (₹70000)<br>2. Add MacBook Air (₹98000)<br>3. Add Sony Headphones (₹6000)<br>4. Check total | Total = ₹173900 (₹70000+₹98000+₹6000-₹100) | Defect: Total = ₹173900 instead of ₹174000 |
| TC031 | Verify search with numeric characters | Products rendered | 1. Type "15" in search<br>2. Observe | iPhone 15 card displayed | Pass |
| TC032 | Verify search with trailing spaces | Products rendered | 1. Type "MacBook " (with trailing space) in search<br>2. Observe | "MacBook " includes space, may not match "MacBook Air" exactly | Defect: Trailing space causes no match |
| TC033 | Verify search with leading spaces | Products rendered | 1. Type " iPhone" (with leading space) in search<br>2. Observe | Leading space causes no match | Defect: Leading space causes no match |
| TC034 | Verify search with special characters in query | Products rendered | 1. Type "@#$%" in search<br>2. Observe | No products displayed (no special chars in names) | Pass (no error thrown) |
| TC035 | Verify product card structure | Products rendered | 1. Inspect a product card | Card contains: image, product name, price, stock, Add to Cart button | Pass |
| TC036 | Verify clicking multiple "Add to Cart" in sequence | Page loaded | 1. Add iPhone 15<br>2. Add Samsung S24<br>3. Add MacBook Air | All 3 items appear in cart list in order added | Pass |
| TC037 | Verify cart item list order matches add order | Cart empty | 1. Add Gaming Mouse first<br>2. Add Sony Headphones second | Gaming Mouse shown before Sony Headphones | Pass |
| TC038 | Verify cart section is below product grid | Page loaded | 1. Scroll down | Cart section with "Shopping Cart" heading appears below the product grid | Pass |
| TC039 | Verify search works immediately on keyup | Products rendered | 1. Type "Keyboard" quickly | Grid filters as you type (on each keyup event) | Pass |
| TC040 | Verify page title | Page loaded | 1. Check browser tab title | Title is "BuggyShop" | Pass |

---

## 2. Negative Test Cases

| ID | Title | Precondition | Steps | Expected Result | Actual Result (Current) |
|----|-------|-------------|-------|-----------------|-------------------------|
| TC041 | Verify adding out-of-stock item is blocked | Products rendered, Samsung S24 stock=0 | 1. Click "Add to Cart" on Samsung S24 | Item should NOT be added; user should see message "Out of stock" | Defect: Item added successfully |
| TC042 | Verify adding item with stock=0 does not increase cart count | Samsung S24 in view | 1. Click "Add to Cart" on Samsung S24<br>2. Check badge | Badge should remain unchanged | Defect: Badge increments |
| TC043 | Verify adding more than available stock | Page loaded, stock values limited | 1. Add iPhone 15 (stock=5) to cart 10 times | App should limit to stock level or show stock exceeded error | Defect: No stock validation; all 10 added |
| TC044 | Verify adding item with invalid/undefined product ID | Page loaded | 1. Call addToCart(999) (non-existent ID) via console | Graceful error handling; no crash or cart corruption | Defect: No error handling; product is undefined |
| TC045 | Verify search with null-like input | Page loaded | 1. Type "null" in search | Should return no products (no product named "null") | Pass |
| TC046 | Verify search with very long string (1000+ chars) | Page loaded | 1. Paste 1000-character string in search | App should handle gracefully without crashing; no products returned | Unknown – potential performance issue |
| TC047 | Verify search with JavaScript injection attempt | Page loaded | 1. Type `<script>alert('xss')</script>` in search | Should be treated as literal text, not executed | No XSS in this context since innerHTML not used directly with search value |
| TC048 | Verify cart total with no items | Cart empty | 1. Observe total when cart is empty | Total = ₹0 | Pass |
| TC049 | Verify repeated rapid clicking of "Add to Cart" | Page loaded | 1. Click "Add to Cart" on Gaming Mouse 20 times rapidly | 20 entries added; no crash (but should ideally prevent) | Defect: No rate limiting or quantity checks |
| TC050 | Verify page behavior when images fail to load | No internet connection | 1. Disconnect internet<br>2. Reload page | Broken image icons appear; page structure remains intact | Pass (alt text not provided though) |
| TC051 | Verify search after adding items to cart | Cart has items | 1. Add iPhone 15 to cart<br>2. Search "Samsung"<br>3. Check cart | Cart should still contain iPhone 15; only product grid filtered | Pass |
| TC052 | Verify cart total with mixed duplicate items | Cart empty | 1. Add iPhone 15 twice<br>2. Add MacBook Air once | 3 total items; Total = ₹70000+₹70000+₹98000-₹100 = ₹237900 | Defect: No deduplication |
| TC053 | Verify page renders with JavaScript disabled | JS disabled in browser | 1. Reload page with JS off | Page shows header, footer, CSS styles, but no products rendered; cart empty | Products rely on JS render() |
| TC054 | Verify adding negative price item (not possible, but via console) | Developer console open | 1. In console: `cart.push({id:999,name:"Hack",price:-5000})`<br>2. updateCart() | Negative total shown: "Total : ₹-5100" | Defect: No price validation |
| TC055 | Verify zero-price item via console manipulation | Console open | 1. cart.push({id:999,name:"Free",price:0})<br>2. updateCart() | Total shows ₹-100 (0 - 100) | Defect: Total still subtracts ₹100 |
| TC056 | Verify adding same product 100 times | Page loaded | 1. Add Gaming Mouse 100 times | Cart shows 100 entries of Gaming Mouse; total = 100*1500 - 100 = ₹149900 | Defect: No upper limit |
| TC057 | Verify search with empty string after non-empty search | Search with "iPhone" done | 1. Clear search box<br>2. Observe grid | All products should reappear | Pass |
| TC058 | Verify search with only spaces | Page loaded | 1. Type "   " (3 spaces) in search | No product names contain spaces only; no products displayed | Pass |
| TC059 | Verify page zoomed to 200% | Page loaded | 1. Zoom browser to 200% | All elements should be visible and functional; no horizontal scroll | Layout uses responsive grid; likely okay |
| TC060 | Verify page zoomed to 25% | Page loaded | 1. Zoom browser to 25% | Elements should remain readable and clickable | Layout may be cramped |
| TC061 | Verify adding item when cart already has same item at max | Any product | 1. Add iPhone 15 to cart 5 times (its stock level) | Cart should either prevent or display quantity | Defect: No quantity tracking |
| TC062 | Verify cart badge overflows with large cart count | Many items added | 1. Add 999 items to cart | Badge displays "999" within the badge shape | OK for 3 digits; may overflow for 4+ |
| TC063 | Verify search with very short input (1 char) | Page loaded | 1. Type "z" (no product starts with z) | No products displayed; no error | Pass |
| TC064 | Verify adding item while search is active | Search filtered to one item | 1. Type "iPhone"<br>2. Click "Add to Cart" on visible card | Item added to cart normally | Pass |
| TC065 | Verify page load with malformed URL | URL accessible | 1. Append random query params like `?x=1&y=2` | Page should load normally; no errors | Unaffected (no server) |
| TC066 | Verify multiple sequential add + search operations | Page loaded | 1. Add iPhone 15<br>2. Search "Keyboard"<br>3. Add Keyboard<br>4. Clear search | Cart has 2 items; all 6 products shown | Pass |
| TC067 | Verify cart with only out-of-stock items | Page loaded | 1. Add Samsung S24 (stock=0) to cart<br>2. Check cart | Cart has Samsung S24 with calculated total | Defect: Stock validation bypassed |
| TC068 | Verify button text on "Add to Cart" remains consistent | Language/locale set to English | 1. Observe all "Add to Cart" buttons | Text reads "Add to Cart" on all cards | Pass |
| TC069 | Verify no console errors on normal interaction | Console open | 1. Add items, search, clear search | No JavaScript errors in console | Pass |
| TC070 | Verify cart total precision with large numbers | Cart empty | 1. Add MacBook Air (₹98000) 100 times via console | Total = 100*98000 - 100 = ₹9,799,900 | Defect: No stock limit, always -₹100 |

---

## 3. Boundary Test Cases

| ID | Title | Precondition | Steps | Expected Result | Actual Result (Current) |
|----|-------|-------------|-------|-----------------|-------------------------|
| TC071 | Verify adding item with minimum price (₹1500 Gaming Mouse) | Cart empty | 1. Add Gaming Mouse | Total = ₹1400 (₹1500 - ₹100 bug) | Defect: -₹100 applied incorrectly |
| TC072 | Verify adding item with maximum price (₹98000 MacBook Air) | Cart empty | 1. Add MacBook Air | Total = ₹97900 (₹98000 - ₹100) | Defect: -₹100 applied incorrectly |
| TC073 | Verify cart with exactly 1 item | Cart empty | 1. Add exactly 1 item (iPhone 15) | Count = 1, one item displayed | Pass |
| TC074 | Verify cart with 0 items (empty) | Fresh load | 1. Do not add anything | Count = 0, no items, total = ₹0 | Pass |
| TC075 | Verify search with exact product name match | Products rendered | 1. Type "iPhone 15" (exact match) | Only iPhone 15 displayed | Pass |
| TC076 | Verify search with single-character match "G" | Products rendered | 1. Type "G" | Gaming Mouse displayed | Pass |
| TC077 | Verify adding item with stock level exactly 1 | Any product with stock=1 (none exist; min stock=2 for MacBook Air) | 1. Add MacBook Air (stock=2) once | Should be allowed; stock remains unchanged | Defect: Stock never decreases |
| TC078 | Verify stock display boundary: stock=0 | Samsung S24 card | 1. Observe stock value | Shows "Stock : 0" | Pass |
| TC079 | Verify stock display boundary: stock=10 | Gaming Mouse card | 1. Observe stock value | Shows "Stock : 10" | Pass |
| TC080 | Verify cart badge with 0 items | Fresh load | 1. Observe badge | Shows "0" | Pass |
| TC081 | Verify cart badge with 1 item | 1 item added | 1. Add 1 item; observe badge | Shows "1" | Pass |
| TC082 | Verify cart badge with max items before UI breaks | Continuous adding | 1. Keep adding items until badge wraps | Badge should display the number without breaking layout | Likely wraps at large numbers |
| TC083 | Verify adding product with id=1 (minimum id) | Page loaded | 1. Click "Add to Cart" on iPhone 15 (id=1) | Added successfully | Pass |
| TC084 | Verify adding product with id=6 (maximum id) | Page loaded | 1. Click "Add to Cart" on Sony Headphones (id=6) | Added successfully | Pass |
| TC085 | Verify total with sum of all 6 products (full cart) | Cart empty | 1. Add all 6 products once each<br>2. Check total | Total = (70000+65000+98000+1500+3500+6000) - 100 = ₹243900 | Defect: Expected ₹244000 |

---

## 4. UI Test Cases

| ID | Title | Precondition | Steps | Expected Result | Actual Result (Current) |
|----|-------|-------------|-------|-----------------|-------------------------|
| TC086 | Verify page layout: header, container, footer | Fresh load | 1. Open page | Header at top, main container in middle, footer at bottom | Pass |
| TC087 | Verify header background color | Page loaded | 1. Inspect header | Background: #1f2937 (dark gray) | Pass |
| TC088 | Verify header text color | Page loaded | 1. Inspect header text | Color: white; font-size: 28px for "BuggyShop" | Pass |
| TC089 | Verify cart badge style | Page loaded | 1. Inspect `.badge` | Background: #ef4444 (red), white text, border-radius: 20px | Pass |
| TC090 | Verify search input width and style | Page loaded | 1. Inspect search input | Width: 100%, padding: 12px, border-radius: 8px, border: 1px solid #ccc, font-size: 16px | Pass |
| TC091 | Verify product grid is responsive | Page loaded, any screen | 1. Resize browser width | Grid uses `auto-fit, minmax(240px, 1fr)`; cards reflow | Pass |
| TC092 | Verify card hover effect | Products rendered | 1. Hover over any product card | Card translates up by 5px (`translateY(-5px)`) with 0.3s transition | Pass |
| TC093 | Verify card image aspect ratio | Products rendered | 1. Inspect card image | Images: width 100%, height 220px, object-fit: cover | Pass |
| TC094 | Verify card shadow | Products rendered | 1. Inspect card | box-shadow: 0 5px 15px rgba(0,0,0,.08); border-radius: 12px | Pass |
| TC095 | Verify price text style | Products rendered | 1. Inspect price element | Color: #2563eb (blue), font-size: 20px, font-weight: bold | Pass |
| TC096 | Verify stock text color | Products rendered | 1. Inspect stock element | Color: gray | Pass |
| TC097 | Verify button default style | Products rendered | 1. Inspect "Add to Cart" button | Background: #2563eb, text: white, border-radius: 8px, width 100%, padding 12px, font-size 15px | Pass |
| TC098 | Verify button hover style | Products rendered | 1. Hover over "Add to Cart" button | Background changes from #2563eb to #1d4ed8 (darker blue) | Pass |
| TC099 | Verify cart section styling | Products rendered | 1. Inspect cart section | Background: white, padding: 20px, border-radius: 12px, box-shadow: 0 5px 15px rgba(0,0,0,.08), margin-top: 40px | Pass |
| TC100 | Verify cart item divider | Items in cart | 1. Add 2 items; inspect cart items | Each item div has padding 8px 0 and border-bottom: 1px solid #eee | Pass |
| TC101 | Verify total text color | Item in cart | 1. Inspect total heading | Color: #2563eb (matching price color), margin-top: 15px | Pass |
| TC102 | Verify page background color | Page loaded | 1. Inspect body | Background: #f4f6f9 (light gray-blue) | Pass |
| TC103 | Verify footer text color and alignment | Page loaded | 1. Inspect footer | Text-align: center, color: #777, margin-top: 60px, padding: 20px | Pass |
| TC104 | Verify emoji in header renders correctly | Page loaded | 1. Observe "🛒" before BuggyShop | Shopping cart emoji displayed | Pass (depends on OS/browser) |
| TC105 | Verify responsive layout on 320px width (mobile) | Page loaded | 1. Set browser width to 320px | Single column grid; content fits without horizontal scroll; cards stack vertically | Based on auto-fit grid, should work |

---

## 5. Accessibility Test Cases

| ID | Title | Precondition | Steps | Expected Result | Actual Result (Current) |
|----|-------|-------------|-------|-----------------|-------------------------|
| TC106 | Verify page has proper `<lang>` attribute | Page loaded | 1. Inspect `<html>` tag | `lang="en"` should be set | Pass |
| TC107 | Verify all images have alt attributes | Products rendered | 1. Inspect `<img>` tags | Each image should have descriptive `alt` text | Defect: No `alt` attributes on any product images |
| TC108 | Verify search input has an associated label | Page loaded | 1. Inspect search input | Should have a `<label>` element or `aria-label` | Defect: No `<label>` tag; placeholder used instead |
| TC109 | Verify buttons have accessible names | Products rendered | 1. Inspect "Add to Cart" buttons | Each button should have distinct accessible name text | Pass (button text is "Add to Cart") |
| TC110 | Verify heading hierarchy is logical | Page loaded | 1. Check `<h1>`–`<h6>` usage | No `<h1>`; `<h2>` for header, cart, total; hierarchy should start with `<h1>` | Defect: Missing `<h1>`, starts with `<h2>` |
| TC111 | Verify color contrast meets WCAG AA standards | Page loaded | 1. Measure contrast of text on background | Price (#2563eb on white) and stock (gray on white) should meet 4.5:1 ratio | Gray stock text likely fails |
| TC112 | Verify page is keyboard navigable | Page loaded | 1. Tab through all interactive elements | Search input, all "Add to Cart" buttons should receive focus in logical order | Pass |
| TC113 | Verify cart count badge is announced to screen readers | Page loaded | 1. Use screen reader | Badge content should be announced when cart updates | Defect: No aria-live region on cart count |
| TC114 | Verify "Add to Cart" button focus indicator | Products rendered | 1. Tab to an "Add to Cart" button | Visible focus ring/outline should appear | Unknown – no custom focus styles |
| TC115 | Verify page works with browser zoom up to 200% | Page loaded | 1. Zoom to 200% using Ctrl+ | All content readable, no overlap, all buttons clickable | Layout uses relative units; likely okay |
| TC116 | Verify semantic HTML structure | Page loaded | 1. Inspect landmarks | `<header>`, `<footer>` present; no `<main>`, `<nav>`, or `<section>` tags | Defect: No `<main>` or `<section>` landmarks |
| TC117 | Verify cart section has heading | Cart section | 1. Inspect cart heading | `<h2>Shopping Cart</h2>` present | Pass |
| TC118 | Verify total is distinguishable from heading | Cart with items | 1. Inspect total text | Uses separate `<h2 id="total">` | Pass |
| TC119 | Verify no flashing or blinking content | Page loaded | 1. Observe page for 10 seconds | No animated, flashing, or auto-refreshing content | Pass |
| TC120 | Verify font size is at least 16px to prevent mobile zoom | Page loaded | 1. Check font sizes | Body uses default; inputs 16px; buttons 15px | Button at 15px may cause iOS zoom on tap |

---

## 6. Cross-browser Test Cases

| ID | Title | Precondition | Steps | Expected Result | Notes |
|----|-------|-------------|-------|-----------------|-------|
| TC121 | Verify page renders in Google Chrome (latest) | Chrome installed | 1. Open page in Chrome | All features work; layout correct | Target primary browser |
| TC122 | Verify page renders in Mozilla Firefox (latest) | Firefox installed | 1. Open page in Firefox | Same as Chrome; CSS grid works, no JS errors | Test CSS Grid support |
| TC123 | Verify page renders in Microsoft Edge (latest) | Edge installed | 1. Open page in Edge | Identical rendering to Chrome (Chromium-based) | Pass |
| TC124 | Verify page renders in Apple Safari (latest) | Safari installed | 1. Open page in Safari | Layout correct; check object-fit: cover support | Note: Safari supports CSS Grid |
| TC125 | Verify page renders on mobile Chrome (Android) | Mobile device/browser emulation | 1. Open page on Android Chrome | Responsive layout; touch interactions work | Test touch events on buttons |
| TC126 | Verify page renders on Mobile Safari (iOS) | iOS device/browser emulation | 1. Open page on iPhone Safari | Responsive layout; no tap delays | Check 15px button font size |
| TC127 | Verify page renders in Chrome incognito mode | Chrome installed | 1. Open in incognito | Same as normal; no localStorage dependencies | Pass (no storage used) |
| TC128 | Verify search and add to cart work in all browsers | Multiple browsers | 1. Add item + search in each browser | Functionality consistent across browsers | Cross-browser JS compatibility |
| TC129 | Verify page in Electron or WebView context | Embedded browser view | 1. Test in a WebView | Page should load and function | No server-dependent features |
| TC130 | Verify page in legacy browser (IE11) | IE11 installed | 1. Open page in IE11 | CSS Grid may not work; fallback needed | Defect: No IE11 support for CSS Grid |

---

## 7. Performance Test Scenarios

| ID | Title | Precondition | Steps | Expected Observation | Metrics |
|----|-------|-------------|-------|---------------------|---------|
| TC131 | Measure initial page load time | Clean cache | 1. Open page with DevTools Network tab | DOMContentLoaded < 2s; Load < 3s (depends on images from picsum.photos) | Load time |
| TC132 | Measure "Add to Cart" response time | Cart empty | 1. Click "Add to Cart" | Cart updates instantly (< 50ms JS execution) | JS execution time |
| TC133 | Measure search response time | 6 products rendered | 1. Type in search box | Filter executes in < 30ms (tiny dataset, O(n)) | JS execution time |
| TC134 | Simulate rapidly adding 50 items to cart | Cart empty | 1. Add same item 50 times quickly | No UI freeze; cart updates each time | UI responsiveness |
| TC135 | Measure page with throttled CPU (4x slowdown) | DevTools CPU throttling | 1. Reload page with 4x CPU slowdown | Page should still be interactive | CPU usage |
| TC136 | Measure page on slow network (Slow 3G) | DevTools network throttling | 1. Reload page with Slow 3G | Images load progressively; page functional before images | Time to interactive |
| TC137 | Memory usage after extended interaction | Clean session | 1. Add items, search, clear, repeat 50x | Memory should not grow unbounded (no leaks) | Heap size |
| TC138 | Measure render performance with many cart items | Cart empty | 1. Programmatically add 10000 items via console | updateCart() should handle large arrays | DOM update time |
| TC139 | Browser tab memory after 30 minutes idle | Page loaded | 1. Leave page open for 30 min | No memory leak; < 50MB heap | Memory retention |
| TC140 | Search with 6 products (max dataset) | All products visible | 1. Type each product name sequentially | Each search completes immediately | Search latency |

---

## 8. Security Test Scenarios

| ID | Title | Precondition | Steps | Expected Result | Actual Result (Current) |
|----|-------|-------------|-------|-----------------|-------------------------|
| TC141 | Verify XSS via search input | Page loaded | 1. Type `<img src=x onerror=alert(1)>` in search<br>2. Observe | Search string treated as text; no script execution | Search value used in `.includes()` only, not in innerHTML directly — safe |
| TC142 | Verify XSS via console manipulation | Console open | 1. `cart.push({name:"<script>alert(1)</script>",price:100})`<br>2. updateCart() | Script tag rendered in cart items via innerHTML | Defect: Direct innerHTML injection without sanitization |
| TC143 | Verify no sensitive data exposed in source | View page source | 1. Right-click → View Page Source | No API keys, secrets, or personal data exposed | Pass |
| TC144 | Verify prototype pollution via console | Console open | 1. `Object.prototype.price = 0`<br>2. Add an item | No unexpected behavior in cart logic | Unknown — may affect `total` calculation |
| TC145 | Verify input length limit on search field | Page loaded | 1. Paste 5000 character string into search | Browser should handle without crash | No maxlength attribute on input |
| TC146 | Verify DOM clobbering via product name | Console open | 1. `cart.push({name:"<div id=total>Hacked</div>",price:100})`<br>2. updateCart() | innerHTML overwrites `#total` element; total heading replaced | Defect: innerHTML can overwrite DOM elements with matching IDs |
| TC147 | Verify console cannot modify rendered products permanently | Console open | 1. `products.pop()` in console | Products array modified in memory; page can be refreshed to reset | Pass (refresh restores data) |
| TC148 | Verify no eval() or setTimeout(string) usage | Source code review | 1. Search for `eval`, `setTimeout(`, `setInterval(` in app.js | No dynamic code execution | Pass |
| TC149 | Verify cart data cannot be manipulated to negative totals | Console open | 1. `cart.push({name:"Hack",price:-100000})`<br>2. updateCart() | Negative total displayed; no validation on price | Defect: No price validation for negative values |
| TC150 | Verify no server-side interaction means no CSRF/SQLi risks | Codebase review | 1. Analyze app.js for network calls | No fetch/XHR; frontend only — CSRF and SQLi not applicable | Pass |

---

## 9. Regression Suite

| ID | Title | Module | Test Type | Description |
|----|-------|--------|-----------|-------------|
| TC151 | Verify product grid renders 6 items after any code change | Rendering | Functional | After code modifications, all 6 products must render correctly with names, prices, stock, images, and buttons |
| TC152 | Verify "Add to Cart" adds item to cart and updates badge | Cart | Functional | Clicking "Add to Cart" must add the item to the cart list and increment the badge count by 1 |
| TC153 | Verify search filters products in real-time | Search | Functional | Typing in search must filter the product grid on each keyup event without errors |
| TC154 | Verify cart total calculation | Cart | Functional | Cart total must be the sum of all item prices (note: known -₹100 bug should remain unless explicitly fixed) |
| TC155 | Verify page layout structure (header, grid, cart, footer) | UI | Visual | After any CSS changes, header, product grid, cart section, and footer must maintain correct positions and styling |

---

## 10. Smoke Suite

| ID | Title | Module | Test Type | Description |
|----|-------|--------|-----------|-------------|
| TC156 | Page loads without errors | Global | Smoke | Open page; no browser console errors; page title "BuggyShop" visible |
| TC157 | Products are displayed | Rendering | Smoke | Product grid shows 6 product cards with name, price, stock, image, and "Add to Cart" button |
| TC158 | "Add to Cart" works | Cart | Smoke | Click any "Add to Cart" button; item appears in Shopping Cart; badge increments |
| TC159 | Search works | Search | Smoke | Type in search box; product grid filters to matching products |
| TC160 | Cart total updates | Cart | Smoke | After adding item(s), total heading in cart section updates (note: known miscalculation) |

---

## 11. Sanity Suite

| ID | Title | Module | Test Type | Description |
|----|-------|--------|-----------|-------------|
| TC161 | Verify product grid has correct number of products | Rendering | Sanity | Exactly 6 product cards visible in grid |
| TC162 | Verify product with stock=0 has "Add to Cart" button visible | UI | Sanity | Samsung S24 (stock=0) card shows "Add to Cart" button (known defect, no change unless explicit fix) |
| TC163 | Verify cart starts empty on fresh load | Cart | Sanity | Cart section shows no items; badge shows "0"; total shows "₹0" |
| TC164 | Verify search with out-of-stock product name | Search | Sanity | Type "Samsung" in search → Samsung S24 card displayed |
| TC165 | Verify emoji + title in header | UI | Sanity | Header displays "🛒 BuggyShop" on left side |