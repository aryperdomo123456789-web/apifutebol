import { Module } from '@nestjs/common';
import { GeradorMagoController } from './gerador-mago.controller';

@Module({
  controllers: [GeradorMagoController],
})
export class GeradorMagoModule {}
