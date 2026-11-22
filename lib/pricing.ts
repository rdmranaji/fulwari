// Delivery and planting rules shared by the cart (client) and the order API (server).
// Sample values until Fulwari confirms its delivery policy.
export const FREE_DELIVERY_FROM = 5000;
export const DELIVERY_FEE = 299;
export const PLANTING_PER_PLANT = 40;

export const GUJARAT_CITIES = ["Anand", "Vadodara", "Ahmedabad", "Gandhinagar", "Nadiad", "Bharuch", "Surat", "Gandhidham", "Bhuj", "Mundra", "Rajkot", "Other city in Gujarat"];

export type Fulfilment = "delivery" | "pickup-anand" | "pickup-gandhidham";

export function quote(subtotal: number, plants: number, fulfilment: Fulfilment, planting: boolean) {
  const delivery = fulfilment === "delivery" ? (subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE) : 0;
  const plantingFee = planting && fulfilment === "delivery" ? plants * PLANTING_PER_PLANT : 0;
  return { subtotal, delivery, planting: plantingFee, total: subtotal + delivery + plantingFee };
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
