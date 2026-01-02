import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}
