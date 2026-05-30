import { BadRequestException } from '@nestjs/common';

export class InviteTokenExpiredException extends BadRequestException {
  constructor() {
    super({
      error: 'INVITE_TOKEN_EXPIRED',
      message: 'Invite token has expired',
    });
  }
}