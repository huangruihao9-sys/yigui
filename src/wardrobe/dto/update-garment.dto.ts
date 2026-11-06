import { MultipartFile } from '@fastify/multipart';

export interface UpdateGarmentDto {
  laundryStatus?: string;
  primaryOwner?: string;
  wearableBy?: string;
  name?: string;
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  notes?: string;
  washingDetails?: string;
  dateAquired?: string;
  files?: AsyncIterableIterator<MultipartFile>;
}
