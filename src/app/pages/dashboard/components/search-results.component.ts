import {Component, inject, model} from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import {EcfrStore} from "../../../stores/ecfr.store";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {InputTextModule} from "primeng/inputtext";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroup} from "primeng/inputgroup";
import {FormsModule} from "@angular/forms";
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from "primeng/accordion";
import {SafeHtmlPipe} from "primeng/menu";

@Component({
    standalone: true,
    selector: 'app-search-results',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, IconFieldModule, InputIconModule, InputTextModule, InputGroupAddonModule, InputGroup, FormsModule, Accordion, AccordionContent, AccordionHeader, AccordionPanel, SafeHtmlPipe],
    templateUrl: 'search-results.component.html'
})
export class SearchResultsComponent {
    private readonly _ecfrStore = inject(EcfrStore);

    selectedAgency = this._ecfrStore.selectedAgency;
    querySearchResults = this._ecfrStore.querySearchResults;

    query = model('');

    searchCfr() {
        this._ecfrStore.searchCfr(this.query());
    }
}
