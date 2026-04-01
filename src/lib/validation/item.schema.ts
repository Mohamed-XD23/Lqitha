import { z } from "zod";
import type { Dictionary } from "../dictionary.types"; 



export const itemSchema = (dict: Dictionary) => {
  const t = dict.item.new.errorMessages
  return z.object({
    // Step 1
    type: z.enum(["LOST", "FOUND"]),
    title: z.string().min(3, t.titleInvalid),
    category: z.enum([
      "PHONE",
      "KEYS",
      "WALLET",
      "DOCUMENTS",
      "ELECTRONICS",
      "OTHER",
    ]),
    description: z.string().min(10, t.descriptionInvalid),

    // Step 2
    location: z.string().min(2, t.locationRequired),
    date: z
      .string()
      .min(1, t.dateRequired)
      .refine(
        (val) => {
          return new Date(val) <= new Date();
        },
        { message: t.dateFuture },
      ),
    imageUrl: z.string().nonempty(t.imageURLRequired),
    phone: z.string().regex(/^\d+$/, t.phoneInvalid).length(10, t.phoneLength),

    secretQuestion: z.string().min(3, t.secretQuestionRequired),
    secretAnswer: z.string().min(3, t.secretAnswerRequired),
  })
  .refine(
    (data) => {
      // السؤال والإجابة مطلوبان لكلا النوعين
      return !!data.secretQuestion && !!data.secretAnswer;
    },
    {
      message: t.secretRequired,
      path: ["secretQuestion"],
    },
  );
}
export type ItemFormData = z.infer<ReturnType<typeof itemSchema>>;