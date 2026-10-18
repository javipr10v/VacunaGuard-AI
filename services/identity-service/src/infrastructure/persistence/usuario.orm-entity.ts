import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('usuarios')
export class UsuarioOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 100 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20 })
  rol!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'brigada_id', type: 'varchar', length: 64, nullable: true })
  brigadaId!: string | null;
}
