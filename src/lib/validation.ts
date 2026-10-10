import { z } from 'zod'

/**
 * Validation utilities foundation.
 * Shared Zod schemas and validation helpers.
 */

export const validateSchema = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ReturnType<T['safeParse']> => {
  return schema.safeParse(data) as ReturnType<T['safeParse']>
}
