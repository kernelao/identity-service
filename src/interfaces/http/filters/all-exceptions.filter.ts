import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import { AuthError } from 'libs/shared-auth/jwt/AuthError';
import { AppError } from '@/application/shared/AppError';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    console.error('[AllExceptionsFilter]', exception);

    // 1) shared-auth (JWT) => 401
    if (exception instanceof AuthError) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: exception.code, // TOKEN_EXPIRED / TOKEN_INVALID
        message: exception.message, // "Invalid or expired token"
      });
      return;
    }

    // 2) Erreurs métier (ton AppError) => status mapping
    if (exception instanceof AppError) {
      const code = exception.code ?? 'INTERNAL';

      const status =
        code === 'UNAUTHORIZED'
          ? 401
          : code === 'FORBIDDEN'
            ? 403
            : code === 'CONFLICT'
              ? 409
              : code === 'TOO_MANY_REQUESTS'
                ? 429
                : 400;

      res.status(status).json({
        statusCode: status,
        code,
        message: exception.message,
      });
      return;
    }

    // 3) HttpException Nest => status + payload Nest
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      res
        .status(status)
        .json(typeof payload === 'string' ? { statusCode: status, message: payload } : payload);
      return;
    }

    // 4) Fallback sécurité
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
