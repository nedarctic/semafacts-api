import { NotFoundException } from "@nestjs/common";

export class IncidentNotFoundException extends NotFoundException {
    constructor(incidentId: string){
        super(`Incident with id ${incidentId} not found`);
    }
}