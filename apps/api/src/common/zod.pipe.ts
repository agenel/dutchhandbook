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
      throw new BadRequestException({
        message: 'Validation failed',
        details: result.error.flatten(),
      });
    }
    return result.data;
  }
}

