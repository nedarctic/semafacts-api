import { NotFoundException } from "@nestjs/common";

export class ReportingPageNotFoundException extends NotFoundException {
    constructor() {
        super('Reporting page not found');
    }
}