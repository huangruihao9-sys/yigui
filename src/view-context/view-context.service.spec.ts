import { ConfigService } from '@nestjs/config';
import { ViewContextService } from './view-context.service';

it('shares this wardrobe URL rather than the upstream default site', async () => {
  const service = new ViewContextService(
    {} as any,
    new ConfigService({
      SITE_URL: 'https://librecloset.lazz.tech',
      AUTH_ENABLED: false,
    }),
    {} as any,
  );
  const context = await service.buildContext({
    url: '/wardrobe/1',
    protocol: 'https',
    hostname: 'wardrobe.example.cn',
    host: 'wardrobe.example.cn:8443',
    headers: {},
    cookies: {},
  } as any);
  expect(context.siteUrl).toBe('https://wardrobe.example.cn:8443');
});
