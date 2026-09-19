import { Update, Start, Ctx, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { LinkValidatorService } from '../link-validator/link-validator.service';
import { Platform } from '@prisma/client';

@Update() // Делает этот класс слушателем событий Telegram
export class BotUpdate {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly linkvalidator: LinkValidatorService,
  ) {}

  // Реакция на команду /start
  @Start()
  async onStart(@Ctx() ctx: Context) {
    // 1. Сохраняем или находим юзера в БД
    if(!ctx.from){
        return;
    }
    const user = await this.userService.findOrCreateUser(ctx.from);

    // 2. Приветствуем его
    await ctx.reply(
      `Привет, ${user.firstName || 'друг'}! 👋\nПришли мне ссылку на видео (TikTok, Reddit), и я попробую его скачать.`,
    );
  }

  // Перехватываем любые текстовые сообщения (ссылки)
  @On('text')
  async onText(@Ctx() ctx: Context) {
    // Безопасно достаем текст (чтобы TypeScript не ругался)
    if(!ctx.from || !ctx.message){
        return;
    }
    if (!('text' in ctx.message)) return;
    const text = ctx.message.text.trim();
    

    // Базовая валидация: проверяем, что это хотя бы похоже на ссылку
    try {
        new URL(text);
        
    } catch (error) {
        await ctx.reply('Пожалуйста, отправь корректную ссылку 🔗');
        return;
    }
    
    const platform = this.linkvalidator.identifyPlatform(text);
    if (platform === Platform.UNKNOWN) {
      await ctx.reply('Извини, я пока не умею скачивать с этого сайта. Поддерживаются: TikTok, Reddit, Instagram.')
      return;
    }

    // Достаем юзера, чтобы привязать историю запроса к нему
    const user = await this.userService.findOrCreateUser(ctx.from);

    // Записываем попытку в базу данных
    await this.prisma.requestHistory.create({
      data: {
        url: text,
        userId: user.id,
        platform
        
        // Платформу пока ставим UNKNOWN, ученик сделает парсер в ДЗ
      },
    });

    // Отвечаем пользователю
    await ctx.reply('Ссылка принята! Добавляю в очередь на скачивание... ⏳');
  }
}