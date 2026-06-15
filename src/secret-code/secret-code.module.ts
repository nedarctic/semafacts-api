import { Module } from '@nestjs/common';
import { SecretCodeService } from './secret-code.service';

@Module({
  providers: [SecretCodeService],
  exports: [SecretCodeService],
})
export class SecretCodeModule { }
