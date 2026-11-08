import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import {
  CredencialesInvalidasException,
  EmailDuplicadoException,
  SinPermisoException,
  UsuarioNoEncontradoException,
} from '../../domain/exceptions/usuario.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(ex: DomainException, host: ArgumentsHost): void {
    const res = host
      .switchToHttp()
      .getResponse<{ status(c: number): { json(b: unknown): void } }>();
    let status = 400;
    if (ex instanceof EmailDuplicadoException) status = 409;
    else if (ex instanceof CredencialesInvalidasException) status = 401;
    else if (ex instanceof UsuarioNoEncontradoException) status = 404;
    else if (ex instanceof SinPermisoException) status = 403;
    res.status(status).json({ statusCode: status, error: ex.name, message: ex.message });
  }
}
