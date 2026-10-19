import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('registros_vacunacion')
@Unique(['ciudadanoId', 'vacuna', 'numeroDosis'])
export class RegistroOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'ciudadano_id', type: 'uuid' })
  ciudadanoId!: string;

  @Column({ type: 'varchar', length: 80 })
  vacuna!: string;

  @Column({ type: 'varchar', length: 60 })
  lote!: string;

  @Column({ name: 'numero_dosis', type: 'int' })
  numeroDosis!: number;

  @Column({ name: 'fecha_aplicacion', type: 'timestamptz' })
  fechaAplicacion!: Date;

  @Column({ name: 'brigadista_id', type: 'varchar', length: 64 })
  brigadistaId!: string;

  @Column({ name: 'reaccion_adversa', type: 'text', nullable: true })
  reaccionAdversa!: string | null;
}
