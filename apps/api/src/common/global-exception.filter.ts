import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

interface ErrorBody {
  statusCode: number;
  message: string;
  /** Field-level validation errors when applicable. */
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const body = this.normalize(exception);

    // Never leak unhandled error stacks to clients in any environment.
    if (body.statusCode >= 500) {
      this.logger.error(
        { path: req.url, method: req.method, err: exception },
        'Unhandled error',
      );
      body.message = 'Internal server error';
      delete body.details;
    }

    res.status(body.statusCode).json(body);
  }

  private normalize(exception: unknown): ErrorBody {
    if (exception instanceof ZodError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        details: exception.flatten(),
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        return { statusCode: status, message: resp };
      }
      const r = resp as { message?: string | string[]; error?: string; details?: unknown };
      return {
        statusCode: status,
        message: Array.isArray(r.message) ? r.message.join(', ') : r.message ?? r.error ?? 'Error',
        details: r.details,
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
