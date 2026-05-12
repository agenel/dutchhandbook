import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailPreviewController } from './mail-preview.controller';

@Module({
  providers: [MailService],
  controllers: [MailPreviewController],
  exports: [MailService],
})
export class MailModule {}
