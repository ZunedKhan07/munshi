import { z } from "zod";
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success)
      return res
        .status(400)
        .json({
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.issues[0]?.message || "Invalid input",
          },
        });
    req.validatedBody = result.data;
    next();
  };
}
export const textSchema = z
  .object({ text: z.string().trim().min(1).max(1000) })
  .strict();
