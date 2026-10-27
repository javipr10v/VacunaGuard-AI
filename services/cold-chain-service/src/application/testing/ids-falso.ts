import type { IdGeneratorPort } from '../ports/out/id-generator.port';

export class IdsFalso implements IdGeneratorPort {
  private n = 0;
  generar() {
    return 'id-' + ++this.n;
  }
}
