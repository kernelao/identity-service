import { IsOptional, IsString } from 'class-validator';

export class ListMembershipsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  limit?: string; // reçu en query string
}
