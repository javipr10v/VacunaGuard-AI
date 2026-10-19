import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ciudadanos')
export class CiudadanoOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'curp_cifrada', type: 'text' })
  curpCifrada!: string;

  @Column({ name: 'curp_huella', type: 'varchar', length: 64, unique: true })
  curpHuella!: string;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento!: string;
}
