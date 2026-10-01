import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

// Пустая строка (или пробелы) в необязательной ссылке = "убрать ссылку" (null в базе)
const emptyToNull = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value));

export const CATEGORIES = ['Development', 'Design', 'AI', 'Startup', 'Education', 'Games', 'Mobile'] as const;

// Ключи иконок проекта — тот же список, что projectIcons во frontend/src/components/ui/ProjectIcon/ProjectIcon.tsx
export const PROJECT_ICONS = ['rocket', 'education', 'code', 'nature', 'health', 'games', 'books', 'mobile', 'design', 'ai', 'music', 'shop'] as const;

export class VacancyDto {
  // Есть у уже существующей позиции: тогда она обновляется, а не создаётся заново (заявки на неё сохраняются)
  @IsOptional()
  @IsUUID()
  id?: string;

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
  @IsIn(PROJECT_ICONS)
  icon?: (typeof PROJECT_ICONS)[number];

  // Ссылки необязательные. Пустая строка = "убрать ссылку" (null в базе).
  // Только http(s) — чтобы нельзя было вписать javascript: и прочее опасное
  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Website must be a valid link like https://example.com' })
  @MaxLength(300)
  websiteUrl?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Source code must be a valid link like https://github.com/you/project' })
  @MaxLength(300)
  repoUrl?: string | null;

  // Дата запуска "2026-10-14". В будущем — проект сначала анонс (Announcements), в этот день запускается.
  // Пустая строка / null — запущен сразу
  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Launch date must look like 2026-10-14' })
  launchAt?: string | null;

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
