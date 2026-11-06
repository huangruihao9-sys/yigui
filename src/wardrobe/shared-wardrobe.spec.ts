import { MikroORM } from '@mikro-orm/core';
import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import { join } from 'path';
import { Garment } from '../dal/entity/garment.entity';
import { Outfit } from '../dal/entity/outfit.entity';
import { OutfitCalendar } from '../dal/entity/outfit-calendar.entity';
import { User } from '../dal/entity/user.entity';
import { CalendarService } from './calendar.service';
import { GarmentService } from './garment.service';
import { OutfitService } from './outfit.service';

// Weather is an external integration, unrelated to reservation rules.
jest.mock('../weather/weather.service', () => ({ WeatherService: class {} }));

describe('shared wardrobe reservations (real SQLite)', () => {
  let orm: MikroORM<BetterSqliteDriver>;
  let calendar: CalendarService;
  let garments: GarmentService;
  let outfits: OutfitService;
  let shirt: Garment;
  let first: Outfit;
  let second: Outfit;
  const date = new Date('2026-12-03T00:00:00Z');

  beforeAll(async () => {
    orm = await MikroORM.init({
      driver: BetterSqliteDriver,
      dbName: ':memory:',
      entities: [join(__dirname, '../dal/entity/*.entity.ts')],
    });
    await orm.schema.createSchema();
  });
  afterAll(async () => {
    await orm?.close(true);
  });
  beforeEach(async () => {
    await orm.schema.clearDatabase();
    const em = orm.em.fork();
    garments = new GarmentService(
      em.getRepository(Garment),
      em.getRepository(User),
      {} as any,
      {} as any,
    );
    outfits = new OutfitService(
      em.getRepository(Outfit),
      em.getRepository(Garment),
      em.getRepository(User),
      garments,
    );
    calendar = new CalendarService(
      em.getRepository(OutfitCalendar),
      em.getRepository(Outfit),
      em.getRepository(User),
      {} as any,
    );
    shirt = await garments.create({ name: '衬衫', category: 'tops' });
    first = await outfits.create({
      name: '上班',
      slots: [{ category: 'tops', garmentId: shirt.id }],
    });
    second = await outfits.create({
      name: '出门',
      slots: [{ category: 'tops', garmentId: shirt.id }],
    });
  });

  const plan = (outfit: Outfit, wearer = 'me', extra: any = {}) =>
    calendar.create({
      date,
      outfitId: outfit.id,
      wearer,
      plannedBy: 'partner',
      ...extra,
    } as any);

  it('persists laundry and mutual wearing choices, and rejects invalid states', async () => {
    await garments.update(shirt.id, {
      laundryStatus: 'washing',
      primaryOwner: 'me',
      wearableBy: 'partner',
    } as any);
    expect(await garments.findOne(shirt.id)).toMatchObject({
      laundryStatus: 'washing',
      primaryOwner: 'me',
      wearableBy: 'partner',
    });
    await expect(
      garments.update(shirt.id, { laundryStatus: 'invalid' } as any),
    ).rejects.toThrow();
  });

  it('accepts the all-status filter submitted by the browser', async () => {
    expect(
      await garments.findAll(undefined, { laundryStatus: '', wearer: '' }),
    ).toHaveLength(1);
  });

  it('lets the partner wear my shared garment and records who planned it', async () => {
    await garments.update(shirt.id, {
      primaryOwner: 'me',
      wearableBy: 'both',
    } as any);
    expect(await plan(first, 'partner')).toMatchObject({
      wearer: 'partner',
      plannedBy: 'partner',
    });
  });

  it('rejects a second reservation for the same garment and date', async () => {
    await plan(first);
    await expect(plan(second, 'partner')).rejects.toThrow();
    expect(await orm.em.fork().count(OutfitCalendar, {})).toBe(1);
  });

  it('rejects concurrent double booking', async () => {
    const results = await Promise.allSettled([
      plan(first),
      plan(second, 'partner'),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await orm.em.fork().count(OutfitCalendar, {})).toBe(1);
  });

  it('does not silently schedule two different outfits for one person on the same day', async () => {
    const trousers = await garments.create({
      name: '裤子',
      category: 'bottoms',
    });
    const other = await outfits.create({
      slots: [{ category: 'bottoms', garmentId: trousers.id }],
    });
    await plan(first);
    await expect(plan(other)).rejects.toThrow();
  });

  it('rejects an empty outfit and missing garment IDs rather than hiding mistakes', async () => {
    const empty = await outfits.create({ name: '空搭配', slots: [] });
    await expect(plan(empty)).rejects.toThrow();
    await expect(
      outfits.create({ slots: [{ category: 'tops', garmentId: 99999 }] }),
    ).rejects.toThrow();
  });

  it.each(['dirty', 'washing', 'drying'])(
    'does not plan %s clothes',
    async (laundryStatus) => {
      await garments.update(shirt.id, { laundryStatus } as any);
      await expect(plan(first)).rejects.toThrow();
    },
  );

  it('rejects archived or unwearable garments', async () => {
    await garments.update(shirt.id, { wearableBy: 'me' } as any);
    await expect(plan(first, 'partner')).rejects.toThrow();
    await garments.archive(shirt.id);
    await expect(plan(first)).rejects.toThrow();
  });

  it('rejects malformed dates and people', async () => {
    await expect(plan(first, 'anyone')).rejects.toThrow();
    await expect(plan(first, 'me', { date: new Date(NaN) })).rejects.toThrow();
    await expect(
      plan(first, 'me', { plannedBy: '<script>' }),
    ).rejects.toThrow();
  });

  it('marks worn clothes dirty and unmarking does not falsely clean them', async () => {
    const entry = await plan(first);
    await calendar.toggleWorn(entry.id);
    expect(await orm.em.fork().findOneOrFail(Garment, shirt.id)).toMatchObject({
      laundryStatus: 'dirty',
    });
    await calendar.toggleWorn(entry.id);
    expect(await orm.em.fork().findOneOrFail(Garment, shirt.id)).toMatchObject({
      laundryStatus: 'dirty',
    });
  });

  it('does not allow changing scheduled outfit garments to bypass reservations', async () => {
    await plan(first);
    await expect(outfits.update(first.id, { slots: [] })).rejects.toThrow();
  });

  it('still lets either person rename a scheduled outfit without changing garments', async () => {
    await plan(first);
    expect(
      await outfits.update(first.id, { name: '新名字', slots: first.slots }),
    ).toMatchObject({ name: '新名字' });
  });

  it('keeps authenticated user outfits inaccessible to the shared wardrobe', async () => {
    const em = orm.em.fork();
    const user = em.create(User, { password: 'unused' });
    const privateOutfit = em.create(Outfit, { name: '私人', owner: user });
    await em.persistAndFlush([user, privateOutfit]);
    await expect(plan(privateOutfit)).rejects.toThrow();
  });
});
