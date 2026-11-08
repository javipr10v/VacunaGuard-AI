import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('lotes')
@Unique(['vacuna', 'numeroLote'])
export class LoteOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 80 })
  vacuna!: string;

  @Column({ name: 'numero_lote', type: 'varchar', length: 60 })
  numeroLote!: string;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ name: 'fecha_caducidad', type: 'date' })
  fechaCaducidad!: string;

  @Column({ name: 'umbral_stock_bajo', type: 'int', default: 20 })
  umbralStockBajo!: number;

  @Column({ name: 'hielera_id', type: 'varchar', length: 10, nullable: true })
  hieleraId!: string | null;
}
