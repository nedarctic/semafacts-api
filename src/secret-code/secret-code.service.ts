import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecretCodeService {
    private readonly chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    generateCode(length = 6): string {
        let result = '';

        for (let i = 0; i < length; i++) {
            result += this.chars[randomInt(0, this.chars.length)];
        }

        return result;
    }

    generateCodes() {
        return {
            code: this.generateCode(),
            secretCode: this.generateCode(),
        };
    }

    async hashSecret(secretCode: string): Promise<string> {
        return bcrypt.hash(secretCode, 10);
    }


    async verifySecret(
        secretCode: string,
        hashedSecret: string,
    ): Promise<boolean> {
        return bcrypt.compare(secretCode, hashedSecret);
    }
}
