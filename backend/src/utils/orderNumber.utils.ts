let orderCounter = 1;

export const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const value = String(orderCounter).padStart(6, "0");
  orderCounter += 1;
  return `NX-${year}-${value}`;
};

