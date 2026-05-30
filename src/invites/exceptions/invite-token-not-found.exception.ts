import { NotFoundException } from '@nestjs/common';

export class InviteTokenNotFoundException extends NotFoundException {
  constructor() {
    super({
      error: 'INVALID_INVITE_TOKEN',
      message: 'Invite token is invalid',
    });
  }
}