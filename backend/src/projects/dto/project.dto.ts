import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const CATEGORIES = ['Development', 'Design', 'AI', 'Startup', 'Education', 'Games', 'Mobile'] as const;

export class VacancyDto {
  @IsString()
  @Length(2, 60)
  title!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

export class CreateProjectDto {
  @IsString()
  @Length(3, 80)
  title!: string;

  @IsString()
  @MaxLength(160)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  fullDescription?: string;

  @IsIn(CATEGORIES)
  category!: (typeof CATEGORIES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(8)
  icon?: string;

  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  stack!: string[];

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => VacancyDto)
  vacancies!: VacancyDto[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed';
}

export class ProjectsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsUUID()
  owner?: string;

  @IsOptional()
  @IsUUID()
  member?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
