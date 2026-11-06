# Data Model: Web de Pizzería Fratelli

The menu is a verified, locally maintained snapshot of the selected food menu. It is read-only in the public site; staff updates it outside the site. No external API or durable order storage is used.

## Entities

### Restaurant

| Field | Meaning | Validation |
|---|---|---|
| `name` | Public restaurant name | Required, non-empty |
| `description` | Optional short presentation shown in the hero | Taken verbatim from the owner-managed public profile; omit if not verified |
| `bannerImage` | Optional approved local banner asset | Omit if usage rights are not verified |
| `phone` | Public telephone number | Required and re-verified before publication |
| `address` | Public street address | Required and re-verified before publication |
| `mapUrl` | Link to a map/location service | Must point to the verified restaurant location |

### Menu and Category

| Field | Meaning | Validation |
|---|---|---|
| `menuId` | Stable identifier for this menu snapshot | Unique |
| `name` | Menu label | For this feature, the food menu only |
| `categories[]` | Ordered menu groups | Non-empty; do not include the separate drinks menu |
| `category.id` | Stable category identifier | Unique within the menu |
| `category.name` | Visible category name | Required, non-empty |
| `category.order` | Presentation order | Non-negative integer |

The current source has five food categories: Entrantes, Nuestras Pastas, Pizzas Familiares, Postres Caseros and Pizzas Medianas. The snapshot can change when the verified source changes; five is not a hard data limit.

### Product and Format

| Field | Meaning | Validation |
|---|---|---|
| `product.id` | Stable local product identifier | Unique |
| `product.categoryId` | Category containing the product | Must refer to an existing category |
| `product.name` | Visible product name | Required, non-empty |
| `product.description` | Optional product description | Show only when verified and non-empty |
| `product.available` | Whether the product can be selected | Unavailable products cannot be added |
| `product.image` | Optional approved local image path and alt text | Must resolve to an asset; meaningful alt text required |
| `product.formats[]` | Purchasable formats and prices | At least one format |
| `format.id` | Stable format identifier | Unique within the product |
| `format.name` | Visible size/format label | Required, non-empty |
| `format.priceCents` | Price in euro cents | Non-negative integer |

If a product has one format, the site can add that format directly. If it has multiple formats, the customer must select one before adding it. Optional extras and product modifications are not part of this feature.

The source item "PIZZA MITAD" (price 0 €, built entirely from half-and-half modifier options) is intentionally excluded from the snapshot because those options are optional extras outside this feature's scope.

### Snapshot sources

| Field | Meaning | Validation |
|---|---|---|
| `sources.verifiedOn` | Date the snapshot was last checked against the sources | ISO date; update on every content change |
| `sources.menu` | Public food-menu reference | Content reference only; never fetched at runtime |
| `sources.contact` | Public profile used for phone and address | Content reference only; never fetched at runtime |

### Cart and Cart Line

| Field | Meaning | Validation |
|---|---|---|
| `cart.lines[]` | Temporary selected products | Empty cart cannot be confirmed |
| `line.productId` | Selected product | Must refer to an available product |
| `line.formatId` | Selected format | Must belong to the selected product |
| `line.quantity` | Number of units | Positive integer |
| `line.unitPriceCents` | Derived price for the selected format | Derived from the menu snapshot; never independently editable |
| `cart.totalCents` | Sum of line subtotals | `sum(quantity * unitPriceCents)` |

A cart line is identified by the product and selected format together. Adding the same product/format again increments its quantity; choosing another format creates a separate line. Removing a line or reducing its quantity recalculates the total immediately. Quantity zero removes the line.

### Demo Confirmation

A demo confirmation is an ephemeral summary of a non-empty cart. It exists only long enough to show the success notification; it is not saved or transmitted. After confirmation, the notification identifies the flow as a demo and the cart returns to the empty state.

## State Transitions

```text
Empty cart
  └─ add available product (select format if needed) → Active cart
Active cart
  ├─ update quantity / remove line → Active cart or Empty cart
  ├─ confirm while non-empty → Demo success notification → Empty cart
  └─ attempt confirm while empty → Validation message; remain Empty cart
```

No transition creates an actual order, payment, account or customer record.
