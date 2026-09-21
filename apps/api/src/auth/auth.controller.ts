import { Body, Controller, Get, Put, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { StudentAuthService } from './student-auth.service';
import { StudentGuard } from './student.guard';

class LoginDto {
  @IsString() @MinLength(3) @MaxLength(40) studentId!: string;
  @IsString() @MinLength(4) @MaxLength(40) pin!: string;
}

class ProfileDto {
  @IsString() @MinLength(1) @MaxLength(60) name!: string;
  @IsIn(['preschool', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5']) classId!: string;
  @IsOptional() @IsString() @MaxLength(8) avatar?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: StudentAuthService) {}

  /** ID + PIN login. First login returns firstLogin:true → create profile to continue. */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    this.auth.assertConfigured();
    const studentId = dto.studentId.toLowerCase().trim();
    if (!this.auth.verifyPin(studentId, dto.pin)) {
      throw new UnauthorizedException('Wrong student ID or PIN.');
    }
    const profile = await this.auth.getProfile(studentId);
    return { token: this.auth.issueToken(studentId), studentId, firstLogin: !profile, profile };
  }

  @Get('me')
  @UseGuards(StudentGuard)
  async me(@Req() req: { studentId: string }) {
    const profile = await this.auth.getProfile(req.studentId);
    return { studentId: req.studentId, profileComplete: !!profile, profile };
  }

  @Put('profile')
  @UseGuards(StudentGuard)
  async saveProfile(@Req() req: { studentId: string }, @Body() dto: ProfileDto) {
    return this.auth.saveProfile(req.studentId, dto);
  }
}
