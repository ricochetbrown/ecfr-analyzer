export interface CfrReference {
    cfr_reference: string;
    hierarchy: Hierarchy;
}

export interface Hierarchy {
    title: string;
    chapter: string;
    part: string;
}
