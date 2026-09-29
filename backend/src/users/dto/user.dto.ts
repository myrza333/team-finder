import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
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

// Пустая строка в необязательном поле = "очистить поле" (null в базе)
const emptyToNull = () => Transform(({ value }) => (value === '' ? null : value));

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];
}

export class UsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
