import {NotFoundException} from "@nestjs/common";

export class UsersNotFoundException extends NotFoundException {
    constructor() {
        super("Some or all users not found");
    }
}