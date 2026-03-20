import { z } from "zod";

export const itemSchema = z
  .object({
    // Step 1
    type: z.enum(["LOST", "FOUND"]),
    title: z.string().min(3, "Title must be at least 3 characters"),
    category: z.enum([
      "PHONE",
      "KEYS",
      "WALLET",
      "DOCUMENTS",
      "ELECTRONICS",
      "OTHER",
    ]),
    description: z.string().min(10, "Description must be at least 10 characters"),

    // Step 2
    location: z.string().min(2, "Location is required"),
    date: z
      .string()
      .min(1, "Date is required")
      .refine(
        (val) => {
          // datetime-local input sends "YYYY-MM-DDTHH:mm" (no timezone)
          // new Date() parses this as local time, so direct comparison is correct
          return new Date(val) <= new Date();
        },
        { message: "Date cannot be in the future" },
      ),
    imageUrl: z.string().optional(),
    phone: z.string().min(9, "Invalid phone number"),

    // Step 3 — مطلوب فقط عند FOUND
    secretQuestion: z.string().optional(),
    secretAnswer: z.string().optional(),
  })
  .refine(
    (data) => {
      // السؤال والإجابة مطلوبان لكلا النوعين
      return !!data.secretQuestion && !!data.secretAnswer;
    },
    {
      message: "Secret question and answer are required",
      path: ["secretQuestion"],
    },
  );

export type ItemFormData = z.infer<typeof itemSchema>;
