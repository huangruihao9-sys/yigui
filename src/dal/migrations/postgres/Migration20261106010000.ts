import { Migration } from '@mikro-orm/migrations';
export class Migration20261106010000 extends Migration {
  override async up(): Promise<void> {
    this.addSql("alter table \"garment\" add column \"laundry_status\" varchar(255) not null default 'clean';");
    this.addSql("alter table \"garment\" add column \"primary_owner\" varchar(255) not null default 'both';");
    this.addSql("alter table \"garment\" add column \"wearable_by\" varchar(255) not null default 'both';");
    this.addSql("alter table \"outfit_calendar\" add column \"wearer\" varchar(255) not null default 'me';");
    this.addSql("alter table \"outfit_calendar\" add column \"planned_by\" varchar(255) not null default 'me';");
  }
}
