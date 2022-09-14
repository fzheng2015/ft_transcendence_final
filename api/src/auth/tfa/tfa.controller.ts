import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, HttpCode, UnauthorizedException } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { CreateTfaDto } from './dto/create-tfa.dto';
import { UpdateTfaDto } from './dto/update-tfa.dto';
import JwtAuthGuard from '../jwt-auth.guard';
import { Response } from 'express';
import ReqWithUser from '../reqWithUser.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Controller('tfa')
export class TfaController {
  constructor(
    private readonly tfaService: TfaService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async register(@Res() res: Response, @Req() req: ReqWithUser) {
    const { otpUrl } = await this.tfaService.genTfaSecret(req.user);
    res.setHeader('content-type', 'image/png');
    return this.tfaService.pipeQrCodeStream(res, otpUrl);
  }

  @Post('loginTfaCheck')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async loginTfaCheck(@Req() req: ReqWithUser, @Body() { tfaCode }: UpdateTfaDto) {
    const user = await this.userService.findUserWithTfaById(req.user.id);
    const isValid = this.tfaService.isTfaCodeValid(tfaCode, user);
    if (!isValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.setTrueTfa(req.user.id);
  }
  @Post('turnoff')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async turnOffTfa(@Req() req: ReqWithUser) {
    await this.userService.setFalseTfa(req.user.id);
  }
  @Post('turnon')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async turnOnTfa(@Req() req: ReqWithUser) {
    await this.userService.setTrueTfa(req.user.id);
  }

  @Post('isCodeValid')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async isCodeValid(@Req() req: ReqWithUser, @Body() { tfaCode }: UpdateTfaDto) {
    const user = await this.userService.findUserWithTfaById(req.user.id);
    const isValid = this.tfaService.isTfaCodeValid(tfaCode, user);
    if (isValid){
      return { isValid: true }
    }
    else{
      return { isValid: false }
    }
  }
  @Get('tfa-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async tfa_status(@Req() req: ReqWithUser) {
    const user = await this.userService.findUserWithTfaById(req.user.id);
    let exists = false;
    if (user.tfaSecret != '' && user.tfaSecret != null){
      exists = true;
    }
    const res = {
      isTfaEnabled: user.isTfaEnabled,
      isTfaInitialized: exists,
    };
    return res;
  }

  @Get('tfa-del')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async tfa_del(@Req() req: ReqWithUser){
    await this.userService.rmTfaSecret(req.user.id);
  }

}
