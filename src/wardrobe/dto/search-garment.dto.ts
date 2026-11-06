import { GarmentColor } from '../garment-color.enum';

export interface SearchGarmentDto {
  laundryStatus?: string;
  wearer?: string;
  keyword?: string;
  category?: string;
  color?: GarmentColor;
  brand?: string;
  size?: string;
  archived?: string;
}
