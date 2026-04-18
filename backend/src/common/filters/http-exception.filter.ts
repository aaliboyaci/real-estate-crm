import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as Record<string, unknown>).message ||
            'Internal server error'
          : 'Internal server error';

    const errorName =
      exception instanceof HttpException
        ? exception.name
        : 'InternalServerError';

    // Log non-HTTP errors for debugging
    if (!(exception instanceof HttpException)) {
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorName,
      ...(!(exception instanceof HttpException) && {
          debug: exception instanceof Error ? exception.message : String(exception),
          stack: exception instanceof Error ? exception.stack?.split('\n').slice(0, 3) : undefined,
        }),
      timestamp: new Date().toISOString(),
    });
  }
}
