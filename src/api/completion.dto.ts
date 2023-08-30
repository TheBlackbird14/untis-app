import { ParseBoolPipe } from "@nestjs/common";
import { IsBoolean } from "class-validator";


export class MarkCompleted {
    @IsBoolean()
    completed: boolean
}