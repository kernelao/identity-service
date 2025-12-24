import { ArrayNotEmpty, IsArray, IsString, MinLength } from 'class-validator';

export class GrantMembershipRequest {
  @IsString()
  @MinLength(1)
  userId!: string;

  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];

  @IsArray()
  scopes!: string[];
}
