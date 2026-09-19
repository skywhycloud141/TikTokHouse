import { Module } from '@nestjs/common';
import { LinkValidatorService } from './link-validator.service';

@Module({
  providers: [LinkValidatorService]
})
export class LinkValidatorModule {}
