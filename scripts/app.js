import {
  CartError,
  addItem,
  confirmDemoOrder,
  createCart,
  getItemCount,
  getTotalCents,
  removeLine,
  setQuantity,
} from './cart.js';

const MENU_URL = 'data/menu.json';

const priceFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const formatPrice = (cents) => priceFormatter.format(cents / 100);
const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const state = {
  menu: { products: [] },
  productsById: new Map(),
  cart: createCart(),
};

function h(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value == null) continue;
    if (name === 'className') element.className = value;
    else if (name === 'text') element.textContent = value;
    else if (name.startsWith('on')) element.addEventListener(name.slice(2).toLowerCase(), value);
    else element.setAttribute(name, value === true ? '' : value);
  }
  element.append(...children.flat().filter((child) => child != null && child !== false));
  return element;
}

const categoryAnchor = (category) => `cat-${category.id}`;

function renderRestaurant(restaurant) {
  const container = document.querySelector('[data-restaurant]');
  const hero = container.closest('.hero');
  if (restaurant.bannerImage) {
    hero.classList.add('hero--with-image');
    hero.prepend(h('img', {
      className: 'hero__image',
      src: restaurant.bannerImage.src,
      alt: restaurant.bannerImage.alt ?? '',
      width: restaurant.bannerImage.width,
      height: restaurant.bannerImage.height,
      fetchpriority: 'high',
    }));
  }
  container.replaceChildren(
    h('h1', { id: 'restaurant-name', className: 'hero__title', text: restaurant.name }),
    restaurant.description
      ? h('p', { className: 'hero__description', text: restaurant.description })
      : null,
    h('div', { className: 'hero__actions' },
      h('a', { className: 'button button--primary', href: '#menu', text: 'Ver la carta' }),
      h('a', { className: 'button button--ghost', href: '#contact', text: 'Cómo llegar' }),
    ),
  );
}

function renderProductImage(product) {
  if (!product.image?.src) return null;
  return h('img', {
    className: 'product-card__image',
    src: product.image.src,
    alt: product.image.alt ?? '',
    width: product.image.width,
    height: product.image.height,
    loading: 'lazy',
    decoding: 'async',
  });
}

function renderPrices(product) {
  if (product.formats.length === 1) {
    return h('p', { className: 'product-card__price', text: formatPrice(product.formats[0].priceCents) });
  }
  return h('ul', { className: 'product-card__formats', 'aria-label': 'Formatos y precios' },
    product.formats.map((format) => h('li', {},
      h('span', { text: format.name }),
      h('span', { className: 'product-card__price', text: formatPrice(format.priceCents) }),
    )),
  );
}

function renderProduct(product) {
  const headingId = `product-${product.id}`;
  return h('li', {},
    h('article', {
      className: `product-card${product.available ? '' : ' product-card--unavailable'}`,
      'aria-labelledby': headingId,
    },
    renderProductImage(product),
    h('div', { className: 'product-card__body' },
      h('h4', { id: headingId, className: 'product-card__name', text: product.name }),
      product.description
        ? h('p', { className: 'product-card__description', text: product.description })
        : null,
      renderPrices(product),
      product.available
        ? renderAddControls(product)
        : h('p', { className: 'product-card__unavailable', text: 'No disponible' }),
    )),
  );
}

function renderMenu(menu) {
  const categories = [...menu.categories].sort((a, b) => a.order - b.order);
  const productsByCategory = new Map();
  for (const product of menu.products) {
    if (!productsByCategory.has(product.categoryId)) productsByCategory.set(product.categoryId, []);
    productsByCategory.get(product.categoryId).push(product);
  }
  const visibleCategories = categories.filter((category) => productsByCategory.has(category.id));

  const nav = document.querySelector('[data-category-nav]');
  nav.replaceChildren(h('ul', {},
    visibleCategories.map((category) => h('li', {},
      h('a', { href: `#${categoryAnchor(category)}`, text: category.name }),
    )),
  ));
  nav.hidden = false;

  document.querySelector('[data-menu-content]').replaceChildren(
    ...visibleCategories.map((category) => {
      const headingId = `${categoryAnchor(category)}-title`;
      return h('section', {
        id: categoryAnchor(category),
        className: 'menu-category',
        'aria-labelledby': headingId,
      },
      h('h3', { id: headingId, text: category.name }),
      h('ul', { className: 'product-grid' },
        productsByCategory.get(category.id).map(renderProduct),
      ));
    }),
  );
}

function renderContact(restaurant) {
  const telHref = `tel:${restaurant.phone.replace(/[^\d+]/g, '')}`;
  document.querySelector('[data-contact]').replaceChildren(
    h('h2', { id: 'contact-title', text: 'Contacto y ubicación' }),
    h('div', { className: 'contact__grid' },
      h('div', { className: 'contact__card' },
        h('h3', { text: 'Teléfono' }),
        h('p', { className: 'contact__value', text: restaurant.phone }),
        h('a', { className: 'button button--primary', href: telHref, text: `Llamar al ${restaurant.phone}` }),
      ),
      h('div', { className: 'contact__card' },
        h('h3', { text: 'Dirección' }),
        h('address', { className: 'contact__value', text: restaurant.address }),
        h('a', {
          className: 'button button--ghost',
          href: restaurant.mapUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, 'Ver en el mapa', h('span', { className: 'visually-hidden', text: ' (se abre en una pestaña nueva)' })),
      ),
    ),
  );
}

/* --------------------------------------------------------------------------
   Demo cart
   -------------------------------------------------------------------------- */

const lineKey = (line) => `${line.productId}:${line.formatId}`;

function lineLabel(line) {
  const product = state.productsById.get(line.productId);
  if (product.formats.length === 1) return product.name;
  const format = product.formats.find((candidate) => candidate.id === line.formatId);
  return `${product.name} (${format.name})`;
}

function announce(message) {
  const announcer = document.querySelector('[data-announcer]');
  announcer.textContent = '';
  requestAnimationFrame(() => { announcer.textContent = message; });
}

function setNotice(type, ...content) {
  const notice = document.querySelector('[data-cart-notice]');
  notice.className = `cart__notice${type ? ` cart__notice--${type}` : ''}`;
  notice.replaceChildren(...content);
}

function renderAddControls(product) {
  const visuallyHiddenName = () => h('span', { className: 'visually-hidden', text: ` ${product.name} al pedido` });

  if (product.formats.length === 1) {
    return h('button', {
      type: 'button',
      className: 'button button--primary product-card__add',
      onClick: () => handleAdd(product, product.formats[0].id),
    }, 'Añadir', visuallyHiddenName());
  }

  const selectId = `format-${product.id}`;
  const errorId = `format-error-${product.id}`;
  const select = h('select', { id: selectId, className: 'product-card__select', 'aria-describedby': errorId },
    h('option', { value: '', text: 'Elige un formato' }),
    product.formats.map((format) => h('option', {
      value: format.id,
      text: `${format.name} · ${formatPrice(format.priceCents)}`,
    })),
  );
  const error = h('p', { id: errorId, className: 'product-card__error', 'aria-live': 'polite' });
  select.addEventListener('change', () => { error.textContent = ''; });

  return h('div', { className: 'product-card__order' },
    h('label', { for: selectId, className: 'product-card__label' },
      'Formato', h('span', { className: 'visually-hidden', text: ` de ${product.name}` })),
    select,
    h('button', {
      type: 'button',
      className: 'button button--primary product-card__add',
      onClick: () => {
        if (!select.value) {
          error.textContent = 'Elige un formato antes de añadir el producto.';
          select.focus();
          return;
        }
        handleAdd(product, select.value);
      },
    }, 'Añadir', visuallyHiddenName()),
    error,
  );
}

function updateCart(nextCart) {
  state.cart = nextCart;
  renderCart();
}

function handleAdd(product, formatId) {
  try {
    updateCart(addItem(state.cart, state.menu, product.id, formatId));
  } catch (error) {
    if (!(error instanceof CartError)) throw error;
    announce(error.message);
    return;
  }
  setNotice(null);
  announce(`${lineLabel({ productId: product.id, formatId })} añadido al pedido.`);
}

function handleQuantity(line, quantity) {
  try {
    updateCart(setQuantity(state.cart, line.productId, line.formatId, quantity));
  } catch (error) {
    if (!(error instanceof CartError)) throw error;
    renderCart();
    announce('Introduce una cantidad válida: un número entero igual o mayor que cero.');
    return;
  }
  announce(quantity === 0
    ? `${lineLabel(line)} eliminado del pedido.`
    : `Cantidad de ${lineLabel(line)}: ${quantity}.`);
}

function handleRemove(line) {
  updateCart(removeLine(state.cart, line.productId, line.formatId));
  announce(`${lineLabel(line)} eliminado del pedido.`);
}

function handleConfirm() {
  let result;
  try {
    result = confirmDemoOrder(state.cart);
  } catch (error) {
    if (!(error instanceof CartError)) throw error;
    setNotice('error', h('p', { text: error.message }));
    return;
  }
  updateCart(result.cart);
  const { itemCount, totalCents } = result.summary;
  setNotice('success',
    h('p', { className: 'cart__notice-title', text: '¡Pedido de demostración confirmado!' }),
    h('p', {
      text: `Has simulado un pedido de ${pluralize(itemCount, 'producto', 'productos')} por ${formatPrice(totalCents)}. `
        + 'Es solo una demostración: no se ha enviado al restaurante ni se ha realizado ningún pago.',
    }),
  );
}

function renderCartLine(line) {
  const label = lineLabel(line);
  const product = state.productsById.get(line.productId);
  const format = product.formats.find((candidate) => candidate.id === line.formatId);
  const key = lineKey(line);
  const quantityId = `quantity-${key.replace(':', '-')}`;

  const quantityInput = h('input', {
    id: quantityId,
    className: 'cart-line__quantity',
    type: 'number',
    inputmode: 'numeric',
    min: '0',
    step: '1',
    value: String(line.quantity),
    'aria-label': `Cantidad de ${label}`,
    'data-focus-key': `qty:${key}`,
  });
  quantityInput.addEventListener('change', () => {
    const raw = quantityInput.value.trim();
    handleQuantity(line, raw === '' ? Number.NaN : Number(raw));
  });

  return h('li', { className: 'cart-line' },
    h('div', { className: 'cart-line__info' },
      h('p', { className: 'cart-line__name', text: product.name }),
      product.formats.length > 1 ? h('p', { className: 'cart-line__format', text: format.name }) : null,
      h('p', { className: 'cart-line__unit', text: `${formatPrice(line.unitPriceCents)} / ud.` }),
    ),
    h('div', { className: 'cart-line__controls' },
      h('button', {
        type: 'button',
        className: 'cart-line__step',
        'aria-label': `Quitar una unidad de ${label}`,
        'data-focus-key': `dec:${key}`,
        onClick: () => handleQuantity(line, line.quantity - 1),
      }, '−'),
      quantityInput,
      h('button', {
        type: 'button',
        className: 'cart-line__step',
        'aria-label': `Añadir una unidad de ${label}`,
        'data-focus-key': `inc:${key}`,
        onClick: () => handleQuantity(line, line.quantity + 1),
      }, '+'),
    ),
    h('p', { className: 'cart-line__subtotal', text: formatPrice(line.quantity * line.unitPriceCents) }),
    h('button', {
      type: 'button',
      className: 'cart-line__remove',
      onClick: () => handleRemove(line),
    }, 'Eliminar', h('span', { className: 'visually-hidden', text: ` ${label} del pedido` })),
  );
}

function renderCart() {
  const { cart } = state;
  const list = document.querySelector('[data-cart-lines]');
  const focusKey = list.contains(document.activeElement) ? document.activeElement.dataset.focusKey : null;
  const hadFocus = list.contains(document.activeElement);

  list.replaceChildren(...cart.lines.map(renderCartLine));

  const count = getItemCount(cart);
  const total = formatPrice(getTotalCents(cart));
  document.querySelector('[data-cart-empty]').hidden = count > 0;
  document.querySelector('[data-cart-total]').textContent = total;

  const badge = document.querySelector('[data-cart-count]');
  badge.hidden = count === 0;
  badge.replaceChildren(String(count), h('span', {
    className: 'visually-hidden',
    text: count === 1 ? ' producto' : ' productos',
  }));

  const bar = document.querySelector('[data-cart-bar]');
  bar.hidden = count === 0;
  bar.textContent = `Ver tu pedido · ${pluralize(count, 'producto', 'productos')} · ${total}`;
  document.body.classList.toggle('has-cart-bar', count > 0);

  if (hadFocus) {
    const target = focusKey && list.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`);
    (target ?? document.getElementById('cart-title')).focus();
  }
}

function initCart() {
  document.querySelector('[data-cart-confirm]').addEventListener('click', handleConfirm);
  renderCart();
}

function showLoadError() {
  const status = document.querySelector('[data-menu-status]');
  status.replaceWith(h('p', {
    className: 'menu__status menu__status--error',
    role: 'alert',
    text: 'No hemos podido cargar la carta. Recarga la página para intentarlo de nuevo.',
  }));
}

async function loadData() {
  const response = await fetch(MENU_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${MENU_URL}`);
  return response.json();
}

async function init() {
  initCart();
  let data;
  try {
    data = await loadData();
  } catch (error) {
    console.error(error);
    showLoadError();
    return;
  }
  state.menu = data.menu;
  state.productsById = new Map(data.menu.products.map((product) => [product.id, product]));
  renderRestaurant(data.restaurant);
  renderContact(data.restaurant);
  renderMenu(data.menu);
  document.querySelector('[data-menu-status]').hidden = true;
}

init();
