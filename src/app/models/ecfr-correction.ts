import {Title} from "./title";
import {CfrReference} from "./cfr-reference";

export interface Correction {
    id: number;
    cfr_references: CfrReference[];
    corrective_action: string;
    error_corrected: string;
    error_occurred: string;
    fr_citation: string;
    position: number;
    display_in_toc: boolean;
    title: Title;
    year: number;
    last_modified: string;
}
