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
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

// Направления человека — тот же список, что stacks во frontend/src/lib/stacks.ts
export const STACKS = [
  'Frontend', 'Backend', 'Fullstack', 'Mobile', 'DevOps', 'Cloud', 'Data Science', 'Machine Learning',
  'Game Development', 'UI/UX Design', 'QA / Testing', 'Embedded', 'Cybersecurity', 'Blockchain',
] as const;

// Пустая строка в необязательном поле = "очистить поле" (null в базе)
const emptyToNull = () => Transform(({ value }) => (value === '' ? null : value));

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 60, { message: 'Name must be 2 to 60 characters' })
  name?: string;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(300)
  bio?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(80)
  location?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl()
  avatarUrl?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ host_whitelist: ['github.com'] })
  githubUrl?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ host_whitelist: ['t.me'] })
  telegramUrl?: string | null;

  // Ссылки только на "свой" сайт — нельзя подсунуть под видом LinkedIn что-то постороннее
  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ host_whitelist: ['linkedin.com'] })
  linkedinUrl?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ host_whitelist: ['instagram.com'] })
  instagramUrl?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ host_whitelist: ['codewars.com'] })
  codewarsUrl?: string | null;

  @IsOptional()
  @emptyToNull()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ host_whitelist: ['leetcode.com'] })
  leetcodeUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  // Направления (до 4) — только из списка STACKS, чтобы у всех были одинаковые названия
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(STACKS, { each: true })
  stacks?: string[];
}

export class UsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  // Фильтр People по направлениям: "Frontend" или несколько через запятую — "Machine Learning,Data Science"
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((s) => s.trim()).filter(Boolean) : value))
  @IsArray()
  @ArrayMaxSize(STACKS.length)
  @IsIn(STACKS, { each: true })
  stack?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  // "Показать ещё": сколько записей пропустить
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  offset?: number;
}

// Settings → Privacy и Settings → Notifications. Все поля необязательные: меняется то, что прислали
export class UserSettingsDto {
  @IsOptional() @IsBoolean() openToProjects?: boolean;
  @IsOptional() @IsBoolean() showInPeople?: boolean;
  @IsOptional() @IsBoolean() showGithub?: boolean;
  @IsOptional() @IsBoolean() showTelegram?: boolean;
  @IsOptional() @IsBoolean() showLocation?: boolean;
  @IsOptional() @IsBoolean() showSocials?: boolean;
  @IsOptional() @IsBoolean() notifyApplications?: boolean;
  @IsOptional() @IsBoolean() notifyApplicationUpdates?: boolean;
  @IsOptional() @IsBoolean() notifyTeam?: boolean;
  @IsOptional() @IsBoolean() notifyDirect?: boolean;
}
