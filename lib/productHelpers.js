export function calculateDiscount(originalPrice, sellingPrice) {
  if (!originalPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
}

export function calculateOriginalPrice(discount, sellingPrice) {
  if (!discount || discount <= 0 || discount > 100) return null;
  return Math.round((sellingPrice / (1 - discount / 100)) * 100) / 100;
}

export function processPriceAndDiscount(price, originalPrice = null, discount = 0) {
  let finalOriginalPrice = originalPrice;
  let finalDiscount = discount;

  if (originalPrice && originalPrice > price) {
    finalDiscount = calculateDiscount(originalPrice, price);
  } else if (discount > 0 && discount <= 100) {
    finalOriginalPrice = calculateOriginalPrice(discount, price);
  } else if (!originalPrice && discount === 0) {
    finalOriginalPrice = null;
    finalDiscount = 0;
  }

  return {
    price,
    originalPrice: finalOriginalPrice,
    discount: finalDiscount,
  };
}
