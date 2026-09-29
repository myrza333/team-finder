import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';

export class ApplyDto {
  // На какую позицию. Не указана — "любая роль"
  @IsOptional()
  @IsUUID()
  vacancyId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(1000)
  message?: string | null;
}

export class DecideDto {
  @IsIn(['accepted', 'rejected'])
  status!: 'accepted' | 'rejected';
}

export class ApplicationsQueryDto {
  @IsOptional()
  @IsIn(['pending', 'accepted', 'rejected'])
  status?: 'pending' | 'accepted' | 'rejected';

  @IsOptional()
  @IsUUID()
  projectId?: string;
}
