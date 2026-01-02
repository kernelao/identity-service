import { IsString, MinLength } from 'class-validator';

export class LogoutRequest {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
