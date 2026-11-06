import { BadRequestException } from '@nestjs/common';

export const LAUNDRY_LABELS: Record<string, string> = {
  clean: '干净',
  dirty: '待洗',
  washing: '清洗中',
  drying: '晾晒中',
};
export const PERSON_LABELS: Record<string, string> = {
  me: '我',
  partner: '女朋友',
  both: '两人共用',
};

export function validateGarmentDetails(dto: {
  laundryStatus?: string;
  primaryOwner?: string;
  wearableBy?: string;
}) {
  if (
    dto.laundryStatus !== undefined &&
    !Object.hasOwn(LAUNDRY_LABELS, dto.laundryStatus)
  ) {
    throw new BadRequestException('请选择有效的洗涤状态');
  }
  for (const value of [dto.primaryOwner, dto.wearableBy]) {
    if (value !== undefined && !Object.hasOwn(PERSON_LABELS, value)) {
      throw new BadRequestException('请选择有效的衣物归属或可穿者');
    }
  }
}

export function validatePerson(value: string) {
  if (value !== 'me' && value !== 'partner') {
    throw new BadRequestException('请选择我或女朋友');
  }
}

export function parsePlanDate(input: string | Date): Date {
  const value =
    input instanceof Date
      ? Number.isFinite(input.getTime())
        ? input.toISOString().slice(0, 10)
        : ''
      : input;
  if (typeof value !== 'string' || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('请选择有效日期');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequestException('请选择有效日期');
  }
  return date;
}
