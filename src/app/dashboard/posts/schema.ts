import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters." })
    .max(100, { message: "Title must not exceed 100 characters." }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters." }),
  category: z
    .string()
    .min(1, { message: "Please select a category." }),
  image_url: z
    .string()
    .url({ message: "Please enter a valid image URL." })
    .or(z.literal(""))
    .optional()
    .nullable(),
});

export type PostFormValues = z.infer<typeof postSchema>;
