import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

const normalizeEmail = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

export class RegisterDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 60, { message: 'Name must be 2 to 60 characters' })
  name!: string;

  @normalizeEmail()
  @IsEmail({}, { message: 'Enter a valid email' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  password!: string;
}

export class LoginDto {
  @normalizeEmail()
  @IsEmail({}, { message: 'Enter a valid email' })
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  @MaxLength(72)
  currentPassword?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  newPassword!: string;
}
