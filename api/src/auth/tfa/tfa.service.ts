import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CreateTfaDto } from './dto/create-tfa.dto';
import { UpdateTfaDto } from './dto/update-tfa.dto';
import { toFileStream } from 'qrcode';

@Injectable()
export class TfaService {

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) { }

  public async genTfaSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpUrl = authenticator.keyuri(
      user.email,
      this.configService.get('TFA_APP_NAME'),
      secret
    );

    await this.userService.setTfaSecret(secret, user.id);
    return { secret, otpUrl };
  }

  public async pipeQrCodeStream(stream: Response, otpUrl: string) {
    return toFileStream(stream, otpUrl);
  }

  public isTfaCodeValid(tfaCode: string, user: User) {
    return authenticator.verify({ token: tfaCode, secret: user.tfaSecret });
  }

}