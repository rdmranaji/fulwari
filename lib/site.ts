export const SITE = {
  name: "Fulwari",
  url: "https://fulwari.in",
  phone: "+91 99133 69100",
  phoneRaw: "+919913369100",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "919913369100",
  email: "fulwari28@gmail.com",
  hours: "Every day, 8 AM to 6 PM",
  main: "Fulwari nursery, NH48, near HTC Foodland, Mogar, Anand, Gujarat",
  branch: "Gandhidham, Kutch, Gujarat",
  gst: "24BUSPB6354B1ZT",
  udyam: "UDYAM-GJ-13-0001400",
  maps: "https://www.google.com/maps/search/?api=1&query=Fulwari+nursery+Mogar+Anand+Gujarat",
};
export const waLink = (msg: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC === "1";
