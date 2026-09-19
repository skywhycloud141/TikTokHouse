import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';
import { endWith } from 'rxjs';

@Injectable()
export class LinkValidatorService {
    constructor(private prisma:PrismaService){}
    identifyPlatform(url:string): Platform | 'UNKNOWN'{
       let hostname: string;

       try {
        hostname = new URL(url).hostname.toLowerCase();
       } catch {
        return Platform.UNKNOWN
       }

       switch (true) {
        case hostname === 'tiktok.com' ||
        hostname.endsWith('.tiktok.com'):
        return Platform.TIKTOK;
        case hostname === 'reddit.com' ||
        hostname.endsWith('.reddit.com'):
        return Platform.REDDIT
        case hostname === 'instagram.com' ||
        hostname.endsWith('.instagram.com'):
        return Platform.INSTAGRAM

        default:
            return Platform.UNKNOWN
       }
        
    }
}
