export interface Agency {
  name: string;
  display_name: string;
  short_name: string;
  sortable_name: string;
  slug: string;
  children: any[];
  cfr_references: CfrReference[];
}

export interface CfrReference {
  title: number;
  chapter: string;
}
