import { z } from "zod";

export const itemSchema = z
  .object({
    // Step 1
    type: z.enum(["LOST", "FOUND"]),
    title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
    category: z.enum([
      "PHONE",
      "KEYS",
      "WALLET",
      "DOCUMENTS",
      "ELECTRONICS",
      "OTHER",
    ]),
    description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),

    // Step 2
    location: z.string().min(2, "المدينة مطلوبة"),
    date: z
      .string()
      .min(1, "التاريخ مطلوب")
      .refine(
        (val) => {
          // التحقق من أن التاريخ والوقت ليسا في المستقبل
          return new Date(val) <= new Date();
        },
        { message: "لا يمكن أن يكون التاريخ في المستقبل" },
      ),
    imageUrl: z.string().optional(),
    phone: z.string().min(9, "رقم الهاتف غير صالح"),

    // Step 3 — مطلوب فقط عند FOUND
    secretQuestion: z.string().optional(),
    secretAnswer: z.string().optional(),
  })
  .refine(
    (data) => {
      // إذا كان النوع FOUND يجب وجود السؤال والإجابة
      if (data.type === "FOUND") {
        return !!data.secretQuestion && !!data.secretAnswer;
      }
      return true;
    },
    {
      message: "السؤال السري والإجابة مطلوبان عند نشر غرض موجود",
      path: ["secretQuestion"],
    },
  );

export type ItemFormData = z.infer<typeof itemSchema>;
