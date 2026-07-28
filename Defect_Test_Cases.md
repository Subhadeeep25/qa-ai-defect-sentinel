# BuggyShop – Defect-Oriented Test Case Suite

> **Application:** BuggyShop — Single-page e-commerce (HTML + CSS + JS vanilla)
> **Total Test Cases:** 165
> **Tests That Generate Defects:** 42
> **Distinct Defects Found:** 18

---

## Legend

| Column | Meaning |
|--------|---------|
| TC ID | Test Case Identifier |
| Category | Functional area (e.g., Cart, Search, UI, Security) |
| Defect? | **YES** = test exposes a bug; **no** = expected behavior works |
| Severity | **High** / **Medium** / **Low** |
| Defect ID | Unique identifier for the underlying defect |
| Defect Summary | Brief description of the bug |

---

## Defect Register (18 Distinct Bugs)

| Defect ID | Severity | Location | Description |
|-----------|----------|----------|-------------|
| BUG-001 | **High** | `updateCart()` (app.js:137-142) | Cart total always subtracts ₹100: `total - 100` instead of `total` |
| BUG-002 | **Medium** | `search()` (app.js:152-154) | Search is case-sensitive: `product.name.includes(keyword)` with no `.toLowerCase()` |
| BUG-003 | **High** | `addToCart()` (app.js:101-105) | Out-of-stock products (stock=0) can still be added to cart — no stock validation |
| BUG-004 | **Low** | `addToCart()` / cart system | Same product can be added multiple times — no quantity tracking or deduplication |
| BUG-005 | **Medium** | `updateCart()` (app.js:119-133) | Cart items rendered via `innerHTML +=` with no sanitization — XSS vulnerability |
| BUG-006 | **Medium** | Cart system | No price validation — negative and zero prices accepted via console manipulation |
| BUG-007 | **Medium** | Cart system | No upper limit on cart item count — memory/performance risk |
| BUG-008 | **Low** | Cart system | Stock levels never decrement when items are added to cart |
| BUG-009 | **Low** | `search()` (app.js:156) | Leading/trailing spaces in search query break matching — no `.trim()` |
| BUG-010 | **Medium** | HTML (`index.html`) | Product `<img>` tags have no `alt` attributes — accessibility failure |
| BUG-011 | **Medium** | HTML (`index.html`) | Search `<input>` has no associated `<label>` or `aria-label` |
| BUG-012 | **Low** | HTML (`index.html`) | Page uses `<h2>` as first heading; no `<h1>` present — poor heading hierarchy |
| BUG-013 | **Low** | HTML (`index.html`) | Cart badge (`#count`) has no `aria-live` region — not announced by screen readers |
| BUG-014 | **Low** | HTML (`index.html`) | No `<main>` or `<section>` semantic landmarks |
| BUG-015 | **Low** | CSS (`index.html`) | "Add to Cart" button `font-size: 15px` may trigger iOS zoom on tap |
| BUG-016 | **Low** | CSS (`index.html`) | No `@supports` or fallback for CSS Grid — fails in IE11 |
| BUG-017 | **Medium** | `updateCart()` (app.js:121) | Product name rendered as raw innerHTML — DOM clobbering possible via crafted names |
| BUG-018 | **Low** | Cart system | No rate limiting on "Add to Cart" clicks — rapid clicking floods cart |

---

## Test Cases (TC001–TC165)

### 1. Functional Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC001 | Page loads with header, grid, search, cart, footer | no | — | — | — |
| TC002 | All 6 product cards render on page load | no | — | — | — |
| TC003 | Product names are correct | no | — | — | — |
| TC004 | Product prices display correct values | no | — | — | — |
| TC005 | Product stock levels display | no | — | — | — |
| TC006 | Product images load from picsum.photos | no | — | — | — |
| TC007 | Each card has Add to Cart button | no | — | — | — |
| TC008 | Clicking Add to Cart adds item to cart list | no | — | — | — |
| TC009 | Cart badge increments from 0 to 1 | no | — | — | — |
| TC010 | Cart total updates after add | **YES** | **High** | BUG-001 | Total shows ₹1400 for ₹1500 item (−₹100 bug) |
| TC011 | Multiple items appear in cart | no | — | — | — |
| TC012 | Same product added twice creates duplicates | **YES** | Low | BUG-004 | No deduplication; item appears twice with no quantity counter |
| TC013 | Search filters by product name | no | — | — | — |
| TC014 | Search is case-sensitive | **YES** | Medium | BUG-002 | Searching "iphone" (lowercase) returns 0 results |
| TC015 | Empty search returns all products | no | — | — | — |
| TC016 | Cart initial state: empty, badge 0, total 0 | no | — | — | — |
| TC017 | Total in Rupee format after add | **YES** | **High** | BUG-001 | iPhone 15 total shows ₹69900 instead of ₹70000 |
| TC018 | Cart persists while page not refreshed | no | — | — | — |
| TC019 | Out-of-stock item has Add to Cart button | **YES** | **High** | BUG-003 | Samsung S24 (stock=0) button is enabled and clickable |
| TC020 | Out-of-stock item can be added | **YES** | **High** | BUG-003 | Samsung S24 added to cart despite 0 stock |
| TC021 | Stock=0 displays correctly | no | — | — | — |
| TC022 | Header has BuggyShop and initial badge 0 | no | — | — | — |
| TC023 | Footer text displayed | no | — | — | — |
| TC024 | Search placeholder text | no | — | — | — |
| TC025 | High-value item MacBook Air total | **YES** | **High** | BUG-001 | Total shows ₹97900 instead of ₹98000 |
| TC026 | Low-value item Gaming Mouse total | **YES** | **High** | BUG-001 | Total shows ₹1400 instead of ₹1500 |
| TC027 | Partial name search | no | — | — | — |
| TC028 | Single character search | no | — | — | — |
| TC029 | Cart total with two items | **YES** | **High** | BUG-001 | Total shows ₹4900 instead of ₹5000 |
| TC030 | Cart total with three items | **YES** | **High** | BUG-001 | Total shows ₹173900 instead of ₹174000 |
| TC031 | Numeric search | no | — | — | — |
| TC032 | Trailing space search fails | **YES** | Low | BUG-009 | Trailing space after product name yields no match |
| TC033 | Leading space search fails | **YES** | Low | BUG-009 | Leading space before product name yields no match |
| TC034 | Special characters in search | no | — | — | — |
| TC035 | Product card structure verified | no | — | — | — |
| TC036 | Sequential add of multiple items | no | — | — | — |
| TC037 | Cart order matches add order | no | — | — | — |
| TC038 | Cart section below product grid | no | — | — | — |
| TC039 | Search triggers on keyup | no | — | — | — |
| TC040 | Page title is BuggyShop | no | — | — | — |

### 2. Negative Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC041 | Out-of-stock addition should be blocked | **YES** | **High** | BUG-003 | Samsung S24 (stock=0) added to cart successfully |
| TC042 | Stock=0 badge should not increment | **YES** | **High** | BUG-003 | Badge increments when adding out-of-stock item |
| TC043 | Adding more than stock limit allowed | **YES** | Medium | BUG-007 | iPhone 15 (stock=5) can be added 10+ times with no limit |
| TC044 | Invalid product ID via console | **YES** | Medium | BUG-003 | `addToCart(999)` passes undefined product to cart — no error handling |
| TC045 | Search with null-like input returns nothing | no | — | — | — |
| TC046 | Very long search string | no | — | — | — |
| TC047 | Script injection in search treated as text | no | — | — | — |
| TC048 | Empty cart total is 0 | no | — | — | — |
| TC049 | Rapid clicking adds all items (no rate limit) | **YES** | Low | BUG-018 | All 20 rapid clicks registered; no rate limiting |
| TC050 | Images fail gracefully when offline | **YES** | Medium | BUG-010 | Broken images have no alt text fallback |
| TC051 | Cart unchanged after search | no | — | — | — |
| TC052 | Cart total with mixed duplicates | **YES** | Low | BUG-004 | No deduplication; total still off by ₹100 |
| TC053 | JS disabled shows no products | no | — | — | — |
| TC054 | Negative price via console (no validation) | **YES** | Medium | BUG-006 | Negative price accepted; total shows ₹−5100 |
| TC055 | Zero price via console (still subtracts 100) | **YES** | Medium | BUG-006 | Zero price item results in ₹−100 total |
| TC056 | Adding 100 times (no upper limit) | **YES** | Medium | BUG-007 | 100 identical entries added with no cap |
| TC057 | Empty string after search resets grid | no | — | — | — |
| TC058 | Only spaces in search returns nothing | no | — | — | — |
| TC059 | 200% zoom layout | no | — | — | — |
| TC060 | 25% zoom layout | no | — | — | — |
| TC061 | Same item at stock limit no quantity tracking | **YES** | Low | BUG-008 | Stock level never decrements; items added freely |
| TC062 | Badge with 999 items | **YES** | Low | BUG-007 | No upper limit on cart count |
| TC063 | Single char with no match | no | — | — | — |
| TC064 | Add while search active | no | — | — | — |
| TC065 | Malformed URL with query params | no | — | — | — |
| TC066 | Sequential add, search, add, clear | no | — | — | — |
| TC067 | Cart with only out-of-stock items | **YES** | **High** | BUG-003 | Out-of-stock Samsung S24 added successfully |
| TC068 | Button text consistent across all cards | no | — | — | — |
| TC069 | No console errors on normal interaction | no | — | — | — |
| TC070 | Large number total precision (known bug) | **YES** | Medium | BUG-001, BUG-007 | 100× MacBook Air = 9,799,900 (off by 100; no limit) |

### 3. Boundary Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC071 | Minimum price item (Gaming Mouse) total | **YES** | **High** | BUG-001 | ₹1400 instead of ₹1500 |
| TC072 | Maximum price item (MacBook Air) total | **YES** | **High** | BUG-001 | ₹97900 instead of ₹98000 |
| TC073 | Cart with exactly 1 item | no | — | — | — |
| TC074 | Cart with 0 items | no | — | — | — |
| TC075 | Exact product name search | no | — | — | — |
| TC076 | Single char match G | no | — | — | — |
| TC077 | Stock never decreases after add | **YES** | Medium | BUG-008 | Stock level unchanged after adding item to cart |
| TC078 | Stock=0 boundary | no | — | — | — |
| TC079 | Stock=10 boundary | no | — | — | — |
| TC080 | Cart badge 0 items | no | — | — | — |
| TC081 | Cart badge 1 item | no | — | — | — |
| TC082 | Cart badge with many items | no | — | — | — |
| TC083 | Minimum id (id=1) iPhone 15 | no | — | — | — |
| TC084 | Maximum id (id=6) Sony Headphones | no | — | — | — |
| TC085 | Total all 6 products (known -100 bug) | **YES** | **High** | BUG-001 | ₹243900 instead of ₹244000 |

### 4. UI Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC086 | Page layout: header, container, footer | no | — | — | — |
| TC087 | Header background #1f2937 | no | — | — | — |
| TC088 | Header text white font-size 28px | no | — | — | — |
| TC089 | Cart badge red bg round | no | — | — | — |
| TC090 | Search input style | no | — | — | — |
| TC091 | Product grid responsive | no | — | — | — |
| TC092 | Card hover translateY(-5px) | no | — | — | — |
| TC093 | Image 100% width 220px height object-fit cover | no | — | — | — |
| TC094 | Card shadow border-radius 12px | no | — | — | — |
| TC095 | Price blue bold 20px | no | — | — | — |
| TC096 | Stock text gray | no | — | — | — |
| TC097 | Button default style | no | — | — | — |
| TC098 | Button hover darkens | no | — | — | — |
| TC099 | Cart section styling | no | — | — | — |
| TC100 | Cart item divider border-bottom | no | — | — | — |
| TC101 | Total color blue | no | — | — | — |
| TC102 | Body background #f4f6f9 | no | — | — | — |
| TC103 | Footer center gray | no | — | — | — |
| TC104 | Emoji in header renders | no | — | — | — |
| TC105 | 320px mobile layout | no | — | — | — |

### 5. Accessibility Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC106 | html lang attribute is en | no | — | — | — |
| TC107 | Images have alt attributes | **YES** | Medium | BUG-010 | All product `<img>` tags lack `alt` attributes |
| TC108 | Search input has no label | **YES** | Medium | BUG-011 | No `<label>` or `aria-label` on search `<input>` |
| TC109 | Buttons have accessible name text | no | — | — | — |
| TC110 | Heading hierarchy missing h1 | **YES** | Low | BUG-012 | Page starts at `<h2>`; no `<h1>` present |
| TC111 | Color contrast gray stock may fail WCAG AA | no | — | — | — |
| TC112 | Page keyboard navigable | no | — | — | — |
| TC113 | Cart badge has no aria-live | **YES** | Low | BUG-013 | Badge updates not announced to screen readers |
| TC114 | Button focus indicator | no | — | — | — |
| TC115 | 200% zoom content readable | no | — | — | — |
| TC116 | Semantic landmarks missing main/section | **YES** | Low | BUG-014 | No `<main>` or `<section>` elements |
| TC117 | Cart section has heading | no | — | — | — |
| TC118 | Total is separate h2 heading | no | — | — | — |
| TC119 | No flashing or auto-refreshing content | no | — | — | — |
| TC120 | Button font-size 15px may cause iOS zoom | **YES** | Low | BUG-015 | 15px font on buttons triggers zoom on iOS tap |

### 6. Cross-browser Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC121 | Chromium renders all features | no | — | — | — |
| TC122 | Firefox renders correctly | no | — | — | — |
| TC123 | Edge renders correctly (Chromium) | no | — | — | — |
| TC124 | Safari CSS Grid support | no | — | — | — |
| TC125 | Mobile Chrome 375px | no | — | — | — |
| TC126 | Mobile Safari 390px | no | — | — | — |
| TC127 | Incognito mode works | no | — | — | — |
| TC128 | Add to cart + search in any browser | no | — | — | — |
| TC129 | WebView context | no | — | — | — |
| TC130 | IE11 CSS Grid issue | **YES** | Low | BUG-016 | No CSS Grid fallback; layout broken in IE11 |

### 7. Performance Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC131 | Initial page load under 3s | no | — | — | — |
| TC132 | Add to Cart response under 50ms | no | — | — | — |
| TC133 | Search response under 30ms | no | — | — | — |
| TC134 | 50 rapid adds no UI freeze | no | — | — | — |
| TC135 | CPU 4x slowdown interactive | no | — | — | — |
| TC136 | Slow 3G network progressive images | no | — | — | — |
| TC137 | Memory stable after 50 interactions | no | — | — | — |
| TC138 | 2000 cart items render | **YES** | Medium | BUG-007 | `updateCart()` uses O(n²) innerHTML — large cart causes lag |
| TC139 | Memory after 30s idle | no | — | — | — |
| TC140 | Search all 6 product names | no | — | — | — |

### 8. Security Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC141 | XSS via search is blocked | no | — | — | — |
| TC142 | XSS via cart console | **YES** | **High** | BUG-005 | `innerHTML +=` renders injected `<script>` tags in cart |
| TC143 | No sensitive data in source | no | — | — | — |
| TC144 | Prototype pollution via console | no | — | — | — |
| TC145 | 5000 char search input no crash | no | — | — | — |
| TC146 | DOM clobbering via innerHTML | **YES** | Medium | BUG-017 | Product name `<div id=total>Hacked</div>` overwrites total element |
| TC147 | Console product.pop() resets on refresh | no | — | — | — |
| TC148 | No eval or setTimeout string usage | no | — | — | — |
| TC149 | Negative price via console | **YES** | Medium | BUG-006 | Negative price −100000 accepted; total shows ₹−100100 |
| TC150 | No server-side interaction | no | — | — | — |

### 9. Regression Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC151 | Product grid renders 6 items | no | — | — | — |
| TC152 | Add to Cart adds item and updates badge | no | — | — | — |
| TC153 | Search filters on keyup | no | — | — | — |
| TC154 | Cart total calculation | **YES** | **High** | BUG-001 | Total always ₹100 less than sum of item prices |
| TC155 | Page layout structure | no | — | — | — |

### 10. Smoke Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC156 | @smoke Page loads without errors | no | — | — | — |
| TC157 | @smoke Products displayed with name, price, stock, image, button | no | — | — | — |
| TC158 | @smoke Add to Cart adds item and increments badge | no | — | — | — |
| TC159 | @smoke Search filters grid | no | — | — | — |
| TC160 | @smoke Cart total updates after add | **YES** | **High** | BUG-001 | Total off by ₹100 (visible even in smoke test) |

### 11. Sanity Test Cases

| TC ID | Title | Defect? | Severity | Defect ID | Defect Summary |
|-------|-------|---------|----------|-----------|----------------|
| TC161 | @sanity Exactly 6 product cards | no | — | — | — |
| TC162 | @sanity Stock=0 has Add to Cart button | **YES** | **High** | BUG-003 | Out-of-stock item still shows clickable Add to Cart button |
| TC163 | @sanity Cart starts empty | no | — | — | — |
| TC164 | @sanity Search by out-of-stock product name | no | — | — | — |
| TC165 | @sanity Header displays emoji + BuggyShop | no | — | — | — |

---

### 12. Failure Test Cases

> These test cases assert **correct** (intended) behavior. When run against the current buggy application, they **FAIL**, serving both as documentation of expected behavior and as regression tests that will pass once defects are fixed.

| TC ID | Title | Category | Expected (Correct) Behavior | Actual (Buggy) Behavior | Fails Due To | Severity |
|-------|-------|----------|----------------------------|-------------------------|--------------|----------|
| TC166 | Add item shows correct total (no −100 bug) | Cart | Gaming Mouse ₹1500 → Total = ₹1500 | Total = ₹1400 | BUG-001 | **High** |
| TC167 | Add out-of-stock item is blocked | Cart | Clicking Add to Cart on Samsung S24 (stock=0) should not add item | Item added to cart successfully | BUG-003 | **High** |
| TC168 | Search is case-insensitive | Search | Searching "iphone" returns iPhone 15 | No results returned | BUG-002 | Medium |
| TC169 | Duplicate items merged with quantity | Cart | Adding iPhone 15 twice shows "iPhone 15 × 2" | Two separate entries; no quantity | BUG-004 | Low |
| TC170 | XSS via cart item name is sanitized | Security | `<script>alert(1)</script>` rendered as text, not executed | Script executes via innerHTML | BUG-005 | **High** |
| TC171 | Negative price rejected | Security | `cart.push({price:-5000})` should show error or clamp to 0 | Negative total shown: ₹−5100 | BUG-006 | Medium |
| TC172 | Cannot add beyond available stock | Cart | iPhone 15 (stock=5): attempt 6th add should be blocked | All 6+ adds succeed | BUG-007 | Medium |
| TC173 | Stock decrements after adding to cart | Cart | iPhone 15 stock goes from 5 → 4 after adding to cart | Stock stays at 5 | BUG-008 | Medium |
| TC174 | Trailing space in search still matches | Search | Searching "iPhone 15 " (with trailing space) finds iPhone 15 | No results returned | BUG-009 | Low |
| TC175 | Leading space in search still matches | Search | Searching " iPhone" (with leading space) finds iPhone 15 | No results returned | BUG-009 | Low |
| TC176 | Product images have alt attributes | Accessibility | All `<img>` tags have descriptive `alt` text | No alt attributes present | BUG-010 | Medium |
| TC177 | Search input has associated label | Accessibility | Search `<input>` has `<label>` or `aria-label` attribute | No label present | BUG-011 | Medium |
| TC178 | Page has correct heading hierarchy starting with h1 | Accessibility | First heading on page is `<h1>` | First heading is `<h2>`, no `<h1>` | BUG-012 | Low |
| TC179 | Cart badge has aria-live region | Accessibility | Badge `<span>` has `aria-live="polite"` for screen reader announcements | No aria-live attribute | BUG-013 | Low |
| TC180 | Page has semantic main and section landmarks | Accessibility | Page includes `<main>`, `<section>` elements | Only `<header>`, `<footer>` present | BUG-014 | Low |
| TC181 | Button font-size ≥ 16px to prevent iOS zoom | Accessibility | "Add to Cart" button font-size is 16px or larger | font-size: 15px | BUG-015 | Low |
| TC182 | Adding iPhone 15 shows correct total 70000 | Cart | iPhone 15 ₹70000 → Total = ₹70000 | Total = ₹69900 | BUG-001 | **High** |
| TC183 | DOM clobbering prevented by sanitizing item names | Security | Product name `<div id=total>Hacked</div>` rendered safely | innerHTML overwrites legitimate DOM elements | BUG-017 | Medium |
| TC184 | Rapid "Add to Cart" clicks are rate-limited | Cart | 20 rapid clicks should add at most 5–10 items (reasonable limit) | All 20 clicks registered | BUG-018 | Low |
| TC185 | Adding item priced at 100 shows correct total | Cart | ₹100 item → Total = ₹100 | Total = ₹0 (₹100 − ₹100) | BUG-001 | **High** |
| TC186 | Adding Sony Headphones shows correct total 6000 | Cart | Sony Headphones ₹6000 → Total = ₹6000 | Total = ₹5900 | BUG-001 | **High** |
| TC187 | Empty cart after clear shows total 0 | Cart | Cleared cart (via `cart.length=0; updateCart()`) → Total = ₹0 | Total = ₹−100 (BUG-001 still applied to empty sum) | BUG-001 | **High** |
| TC188 | Add to Cart button has accessible aria-label | Accessibility | Button has `aria-label` attribute for screen readers | No `aria-label` on any button | BUG-010 | Medium |
| TC189 | Adding Mechanical Keyboard shows correct total 3500 | Cart | Mechanical Keyboard ₹3500 → Total = ₹3500 | Total = ₹3400 | BUG-001 | **High** |
| TC190 | Out-of-stock "Add to Cart" button is disabled | UI | Samsung S24 button has `disabled` attribute or "Out of Stock" text | Button is enabled with "Add to Cart" text | BUG-003 | **High** |

---

## Summary of Defects by Severity

| Severity | Count | Defect IDs |
|----------|-------|------------|
| **High** | 3 | BUG-001 (cart total), BUG-003 (out-of-stock), BUG-005 (XSS) |
| **Medium** | 7 | BUG-002 (case-sensitive), BUG-006 (price validation), BUG-007 (no limit), BUG-008 (stock), BUG-010 (alt/label/aria), BUG-011 (label), BUG-017 (DOM clobber) |
| **Low** | 8 | BUG-004 (duplicates), BUG-009 (spaces), BUG-012 (h1), BUG-013 (aria-live), BUG-014 (landmarks), BUG-015 (font), BUG-016 (IE11), BUG-018 (rate limit) |

## Test Execution Summary

| Category | Total | Defect-Generating | Pass |
|----------|-------|-------------------|------|
| Functional (TC001–040) | 40 | 12 | 40/40 |
| Negative (TC041–070) | 30 | 13 | 30/30 |
| Boundary (TC071–085) | 15 | 4 | 15/15 |
| UI (TC086–105) | 20 | 0 | 20/20 |
| Accessibility (TC106–120) | 15 | 5 | 15/15 |
| Cross-browser (TC121–130) | 10 | 1 | 10/10 |
| Performance (TC131–140) | 10 | 1 | 10/10 |
| Security (TC141–150) | 10 | 3 | 10/10 |
| Regression (TC151–155) | 5 | 1 | 5/5 |
| Smoke (TC156–160) | 5 | 1 | 5/5 |
| Sanity (TC161–165) | 5 | 1 | 5/5 |
| Failure (TC166–190) | 25 | 25 | 0/25 (all fail on buggy app) |
| **Total** | **190** | **67** | **165/190** |
