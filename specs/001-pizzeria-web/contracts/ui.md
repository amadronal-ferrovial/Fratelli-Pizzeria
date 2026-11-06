# Public UI Contract

## Page surface

- One Spanish-language, customer-facing page with clear sections for restaurant identity/banner, the food menu, the temporary cart and contact/location.
- The menu contains the food categories from the verified menu snapshot only; the separate drinks menu is excluded.
- No staff product editor, account, checkout form, payment action or real-order submission is exposed.
- Layout remains readable and operable on small screens and desktop/low-end PCs.

## Menu interactions

- Each available product exposes its verified name and price, with description, format and image only when present in the approved catalog.
- A product with multiple priced formats requires a format selection before it can be added. No optional extras are offered.
- Unavailable products cannot be added. Missing images or descriptions do not prevent product selection or leave broken visual placeholders.

## Cart and demo flow

- Customers can add products, change positive integer quantities, remove lines and see an updated total.
- Distinct formats of a product are distinct cart lines; repeating the same product and format increments its quantity.
- Empty-cart confirmation is prevented and explained.
- Confirming a non-empty cart shows a visible success notification that clearly states no real order was sent, then clears the cart.
- The cart and confirmation are temporary; no payment, personal data or durable order record is created.

## Contact and accessibility

- Show the verified telephone and full address. The phone control uses a telephone link; the location control opens the verified map location.
- All interactive controls are keyboard-operable, have accessible names and visible focus. Dynamic cart feedback and the success notification are announced to assistive technology without unexpectedly moving focus.
- Product and banner images require meaningful alternative text; decorative images use empty alternative text.

## External interface boundary

The page exposes no public API. Tipsi and Tripadvisor are content-reference sources only; the delivered site does not call either service at runtime. Contact/map actions may navigate to the user's phone or map application.
