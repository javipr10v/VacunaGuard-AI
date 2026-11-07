import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { LoteDuplicadoException, LoteNoEncontradoException } from '../../domain/exceptions/lote.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(ex: DomainException, host: ArgumentsHost): void {
    const res = host
      .switchToHttp()
      .getResponse<{ status(c: number): { json(b: unknown): void } }>();
    let status = 400;
    if (ex instanceof LoteDuplicadoException) status = 409;
    else if (ex instanceof LoteNoEncontradoException) status = 404;
    res.status(status).json({ statusCode: status, error: ex.name, message: ex.message });
  }
}
