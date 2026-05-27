// Remplace G-XXXXXXXXXX par ton vrai ID Google Analytics
export const GA_ID = process.env.REACT_APP_GA_ID || 'G-XXXXXXXXXX';

export const trackPageView = (path) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_ID, { page_path: path });
  }
};

export const trackEvent = (action, category, label, value) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

// Events prédéfinis
export const analytics = {
  addToCart: (product) => trackEvent('add_to_cart', 'ecommerce', product.name, product.price),
  removeFromCart: (product) => trackEvent('remove_from_cart', 'ecommerce', product.name),
  beginCheckout: (total) => trackEvent('begin_checkout', 'ecommerce', 'checkout', total),
  purchase: (orderId, total) => trackEvent('purchase', 'ecommerce', orderId, total),
  viewProduct: (product) => trackEvent('view_item', 'ecommerce', product.name, product.price),
  search: (query) => trackEvent('search', 'engagement', query),
  signup: (method) => trackEvent('sign_up', 'auth', method),
  login: (method) => trackEvent('login', 'auth', method),
  wishlistToggle: (product) => trackEvent('add_to_wishlist', 'engagement', product.name),
};