import { NotFoundException } from "@nestjs/common"

export class HandlerNotFoundException extends NotFoundException {
    constructor(handlerId: string) {
        super(`Handler with ID: ${handlerId} not found`)
    }
}