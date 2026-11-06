// Pure, DOM-free demo cart. Every operation returns a new cart and never
// creates an order, payment or customer record.

export class CartError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CartError';
    this.code = code;
  }
}

export const createCart = () => ({ lines: [] });

const isSameLine = (line, productId, formatId) =>
  line.productId === productId && line.formatId === formatId;

function findFormat(menu, productId, formatId) {
  const product = menu.products.find((candidate) => candidate.id === productId);
  if (!product) throw new CartError('UNKNOWN_PRODUCT', `Producto desconocido: ${productId}`);
  if (!product.available) {
    throw new CartError('UNAVAILABLE_PRODUCT', `${product.name} no está disponible`);
  }
  const format = product.formats.find((candidate) => candidate.id === formatId);
  if (!format) throw new CartError('INVALID_FORMAT', `Elige un formato válido para ${product.name}`);
  return format;
}

export function addItem(cart, menu, productId, formatId) {
  const format = findFormat(menu, productId, formatId);
  const existing = cart.lines.find((line) => isSameLine(line, productId, formatId));
  if (existing) {
    return {
      lines: cart.lines.map((line) => (line === existing ? { ...line, quantity: line.quantity + 1 } : line)),
    };
  }
  return {
    lines: [...cart.lines, { productId, formatId, quantity: 1, unitPriceCents: format.priceCents }],
  };
}

export function setQuantity(cart, productId, formatId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new CartError('INVALID_QUANTITY', 'La cantidad debe ser un número entero positivo');
  }
  if (quantity === 0) return removeLine(cart, productId, formatId);
  return {
    lines: cart.lines.map((line) => (isSameLine(line, productId, formatId) ? { ...line, quantity } : line)),
  };
}

export function removeLine(cart, productId, formatId) {
  return { lines: cart.lines.filter((line) => !isSameLine(line, productId, formatId)) };
}

export const getTotalCents = (cart) =>
  cart.lines.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);

export const getItemCount = (cart) => cart.lines.reduce((count, line) => count + line.quantity, 0);

export function confirmDemoOrder(cart) {
  if (cart.lines.length === 0) {
    throw new CartError('EMPTY_CART', 'Añade al menos un producto antes de confirmar el pedido.');
  }
  return {
    summary: { demo: true, itemCount: getItemCount(cart), totalCents: getTotalCents(cart) },
    cart: createCart(),
  };
}
