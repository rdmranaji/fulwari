import { z } from "zod";

const phone = z.string().trim().regex(/^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "Enter a 10-digit Indian mobile number");

export const OrderInput = z.object({
  items: z.array(z.object({ sku: z.string().min(1).max(40), qty: z.number().int().min(1).max(999) })).min(1).max(50),
  name: z.string().trim().min(2).max(80),
  phone,
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  fulfilment: z.enum(["delivery", "pickup-anand", "pickup-gandhidham"]),
  address: z.string().trim().max(300).optional().default(""),
  city: z.string().trim().max(60).optional().default(""),
  pincode: z.string().trim().max(10).optional().default(""),
  planting: z.boolean().default(false),
  payment: z.enum(["cod", "online"]),
  notes: z.string().trim().max(500).optional(),
}).superRefine((o, ctx) => {
  if (o.fulfilment === "delivery") {
    if (o.address.length < 8) ctx.addIssue({ code: "custom", path: ["address"], message: "Enter the full delivery address" });
    if (!/^3[6-9]\d{4}$/.test(o.pincode)) ctx.addIssue({ code: "custom", path: ["pincode"], message: "We deliver within Gujarat (pincodes 36xxxx to 39xxxx)" });
    if (!o.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Choose a city" });
  }
});
export type OrderInputT = z.infer<typeof OrderInput>;

export const EnquiryInput = z.object({
  type: z.enum(["BULK", "VISIT", "DEALER"]),
  name: z.string().trim().min(2).max(80),
  phone,
  company: z.string().trim().max(120).optional(),
  buyerType: z.string().trim().max(60).optional(),
  city: z.string().trim().max(80).optional(),
  plants: z.string().trim().max(2000).optional(),
  quantity: z.string().trim().max(40).optional(),
  timeline: z.string().trim().max(60).optional(),
  visitDate: z.string().trim().max(20).optional(),
  nursery: z.string().trim().max(60).optional(),
});
export type EnquiryInputT = z.infer<typeof EnquiryInput>;

export const issues = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [i.path.join("."), i.message]));
