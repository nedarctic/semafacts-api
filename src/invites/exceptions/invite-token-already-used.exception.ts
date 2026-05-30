import { BadRequestException } from '@nestjs/common';

export class InviteAlreadyUsedException extends BadRequestException {
  constructor() {
    super({
      error: 'INVITE_ALREADY_USED',
      message: 'This invite has already been used',
    });
  }
}