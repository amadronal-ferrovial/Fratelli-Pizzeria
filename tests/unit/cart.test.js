import {
  CartError,
  addItem,
  confirmDemoOrder,
  createCart,
  getItemCount,
  getTotalCents,
  removeLine,
  setQuantity,
} from '../../scripts/cart.js';

const menu = {
  products: [
    {
      id: 'camembert',
      name: 'CAMEMBERT FRITO',
      available: true,
      formats: [{ id: 'unico', name: 'Formato Unico', priceCents: 1045 }],
    },
    {
      id: 'pizza',
      name: 'PIZZA PRUEBA',
      available: true,
      formats: [
        { id: 'mediana', name: 'Mediana', priceCents: 995 },
        { id: 'familiar', name: 'Familiar', priceCents: 2245 },
      ],
    },
    {
      id: 'agotado',
      name: 'PRODUCTO AGOTADO',
      available: false,
      formats: [{ id: 'unico', name: 'Formato Unico', priceCents: 500 }],
    },
  ],
};

const expectCartError = (fn, code) => {
  expect(fn).toThrow(CartError);
  try {
    fn();
  } catch (error) {
    expect(error.code).toBe(code);
  }
};

describe('cart', () => {
  test('starts empty with a zero total', () => {
    const cart = createCart();
    expect(cart.lines).toEqual([]);
    expect(getTotalCents(cart)).toBe(0);
    expect(getItemCount(cart)).toBe(0);
  });

  test('adds an available product with its price derived from the menu', () => {
    const cart = addItem(createCart(), menu, 'camembert', 'unico');
    expect(cart.lines).toEqual([
      { productId: 'camembert', formatId: 'unico', quantity: 1, unitPriceCents: 1045 },
    ]);
    expect(getTotalCents(cart)).toBe(1045);
  });

  test('increments the quantity when the same product and format are added again', () => {
    let cart = addItem(createCart(), menu, 'camembert', 'unico');
    cart = addItem(cart, menu, 'camembert', 'unico');
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(2);
    expect(getTotalCents(cart)).toBe(2090);
  });

  test('keeps different formats of a product as separate lines', () => {
    let cart = addItem(createCart(), menu, 'pizza', 'mediana');
    cart = addItem(cart, menu, 'pizza', 'familiar');
    expect(cart.lines.map((line) => [line.formatId, line.unitPriceCents])).toEqual([
      ['mediana', 995],
      ['familiar', 2245],
    ]);
    expect(getTotalCents(cart)).toBe(3240);
  });

  test('does not mutate the previous cart state', () => {
    const empty = createCart();
    const cart = addItem(empty, menu, 'camembert', 'unico');
    addItem(cart, menu, 'camembert', 'unico');
    expect(empty.lines).toEqual([]);
    expect(cart.lines[0].quantity).toBe(1);
  });

  test('rejects unknown, unavailable or invalid-format selections', () => {
    const cart = createCart();
    expectCartError(() => addItem(cart, menu, 'missing', 'unico'), 'UNKNOWN_PRODUCT');
    expectCartError(() => addItem(cart, menu, 'agotado', 'unico'), 'UNAVAILABLE_PRODUCT');
    expectCartError(() => addItem(cart, menu, 'pizza', 'unico'), 'INVALID_FORMAT');
    expectCartError(() => addItem(cart, menu, 'pizza', undefined), 'INVALID_FORMAT');
  });

  test('changes the quantity of a line and recalculates the total', () => {
    let cart = addItem(createCart(), menu, 'camembert', 'unico');
    cart = addItem(cart, menu, 'pizza', 'familiar');
    cart = setQuantity(cart, 'pizza', 'familiar', 3);
    expect(cart.lines[1].quantity).toBe(3);
    expect(getTotalCents(cart)).toBe(1045 + 3 * 2245);
    expect(getItemCount(cart)).toBe(4);
  });

  test('removes the line when its quantity is set to zero', () => {
    let cart = addItem(createCart(), menu, 'camembert', 'unico');
    cart = setQuantity(cart, 'camembert', 'unico', 0);
    expect(cart.lines).toEqual([]);
    expect(getTotalCents(cart)).toBe(0);
  });

  test('rejects quantities that are not non-negative integers', () => {
    const cart = addItem(createCart(), menu, 'camembert', 'unico');
    for (const quantity of [-1, 1.5, Number.NaN, '2']) {
      expectCartError(() => setQuantity(cart, 'camembert', 'unico', quantity), 'INVALID_QUANTITY');
    }
  });

  test('removes a line and keeps the remaining total accurate', () => {
    let cart = addItem(createCart(), menu, 'camembert', 'unico');
    cart = addItem(cart, menu, 'pizza', 'mediana');
    cart = removeLine(cart, 'camembert', 'unico');
    expect(cart.lines.map((line) => line.productId)).toEqual(['pizza']);
    expect(getTotalCents(cart)).toBe(995);
  });

  test('refuses to confirm an empty cart', () => {
    expectCartError(() => confirmDemoOrder(createCart()), 'EMPTY_CART');
  });

  test('confirms a non-empty demo order by summarising it and returning an empty cart', () => {
    let cart = addItem(createCart(), menu, 'camembert', 'unico');
    cart = setQuantity(cart, 'camembert', 'unico', 2);
    const result = confirmDemoOrder(cart);
    expect(result.summary).toEqual({ demo: true, itemCount: 2, totalCents: 2090 });
    expect(result.cart.lines).toEqual([]);
  });
});
