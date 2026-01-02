import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import { AuthError } from 'libs/shared-auth/jwt/AuthError';
import { AppError } from '@/application/shared/AppError';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // LOG (simple)
    console.error('[AllExceptionsFilter]', exception);

    // 1) shared-auth AuthError => 401
    if (exception instanceof AuthError) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: exception.code, // TOKEN_EXPIRED / TOKEN_INVALID
        message: exception.message,
      });
      return;
    }

    // 2) AppError => statusCode porté par l’erreur (source de vérité)
    if (exception instanceof AppError) {
      const status = exception.statusCode ?? HttpStatus.BAD_REQUEST;

      res.status(status).json({
        statusCode: status,
        code: exception.code ?? 'INTERNAL',
        message: exception.message,
      });
      return;
    }

    // 3) HttpException Nest => status + payload
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      res
        .status(status)
        .json(typeof payload === 'string' ? { statusCode: status, message: payload } : payload);
      return;
    }

    // 4) fallback
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
