import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IncidentJwtAuthGuard extends AuthGuard('incident-jwt'){}