import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // HttpException NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      response
        .status(status)
        .json(typeof payload === 'string' ? { statusCode: status, message: payload } : payload);
      return;
    }

    // Erreurs applicatives (UnauthorizedError, ConflictError, etc.)
    const appError = exception as {
      code?: string;
      message?: string;
      statusCode?: number;
    };

    if (appError?.code && typeof appError.message === 'string') {
      const status = appError.statusCode ?? HttpStatus.BAD_REQUEST;

      response.status(status).json({
        statusCode: status,
        code: appError.code,
        message: appError.message,
      });
      return;
    }

    // Fallback sécurité
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
