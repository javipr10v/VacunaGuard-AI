import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { PuntoNoEncontradoException } from '../../domain/exceptions/ruta.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(ex: DomainException, host: ArgumentsHost): void {
    const res = host
      .switchToHttp()
      .getResponse<{ status(c: number): { json(b: unknown): void } }>();
    const status = ex instanceof PuntoNoEncontradoException ? 404 : 400;
    res.status(status).json({ statusCode: status, error: ex.name, message: ex.message });
  }
}
