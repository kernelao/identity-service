import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '@/application/shared/AppError';

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter<AppError> {
  catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

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
  }
}
