import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * Generic Zod validation pipe. Use as:
 * `@Body(new ZodValidationPipe(LoginSchema))`.
 *
 * Produces a consistent validation error shape the SPA can render.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const flattened = result.error.flatten();
      const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;
      const firstError = Object.values(fieldErrors)[0]?.[0];
      throw new BadRequestException({
        message: firstError ? `Validation error: ${firstError}` : 'Validation failed',
        details: flattened,
      });
    }
    return result.data;
  }
}

