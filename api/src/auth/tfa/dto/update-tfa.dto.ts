import { PartialType } from '@nestjs/mapped-types';
import { CreateTfaDto } from './create-tfa.dto';
import { IsString } from 'class-validator';

export class UpdateTfaDto extends PartialType(CreateTfaDto) {
    @IsString()
    tfaCode: string;
}
