const endpoints = {
	get: "/cart.json",
	add: "/cart/add.js",
	update: "/cart/update.js",
	change: "/cart/change.js",
};

const fetchCart = (shouldOpen = true) => {
  fetch(endpoints.get)
    .then(response => response.json())
    .then(data => {
      const elToggles = document.querySelectorAll('cart-toggle');
      const elCounts = document.querySelectorAll('[data-cart-count]');
      const elDrawer = document.querySelector('cart-drawer');

      elToggles.forEach(el => el.setAttribute('count', data.item_count));
      elCounts.forEach(el => el.innerHTML = `(${data.item_count})`);
      shouldOpen && elDrawer.setAttribute('open', true);

      window.cart = data;
      window.renderCart();
    })
    .catch()
}

const postCart = async (data, endpoint) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await response.json();
  fetchCart();
  return json;
}

window.addToCart = (data) => { postCart(data, endpoints.add) };
window.updateCart = (data) =>{ postCart(data, endpoints.update) };

const formatMoney = (number, precision = 2, thousands = ',', decimal = '.') => {
  if (isNaN(number) || number == null) {
    return 0;
  }

  if (precision == 0 && (number / 100.0) % 1 != 0) {
    number = (number / 100.0).toFixed(2);
  } else {
    number = (number / 100.0).toFixed(precision);
  }

  const { active: activeCurrency } = window.Shopify.currency;
  const currencySymbol =  window.currencies && window.currencies[activeCurrency] ? window.currencies[activeCurrency] : '$';

  let parts = number.split(".");
	let dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `${currencySymbol}1` + thousands);
  let cents = parts[1] ? decimal + parts[1] : "";

  return `${currencySymbol}${dollars + cents}`;
}