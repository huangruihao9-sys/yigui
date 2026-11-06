export interface CreateCalendarEntryDto {
  date: Date | string;
  wearer?: string;
  plannedBy?: string;
  outfitId: number;
  notes?: string;
}
