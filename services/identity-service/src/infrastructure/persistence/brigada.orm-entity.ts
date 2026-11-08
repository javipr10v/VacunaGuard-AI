import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('brigadas')
export class BrigadaOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  clave!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  creada_en!: Date;
}
