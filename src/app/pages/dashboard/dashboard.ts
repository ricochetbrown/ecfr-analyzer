import {Component, computed, effect, inject, Signal} from '@angular/core';
import {CorrectionsComponent} from './components/corrections.component';
import { VisualizationComponent } from './components/visualization.component';
import { CfrReferencesComponent } from './components/cfr-references.component';
import {Agency} from "../../models/agency";
import {EcfrStore} from "../../stores/ecfr.store";
import {SearchResultsComponent} from "./components/search-results.component";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import {FormsModule} from "@angular/forms";
import {Fluid} from "primeng/fluid";

@Component({
    selector: 'app-dashboard',
    imports: [VisualizationComponent, CfrReferencesComponent, CorrectionsComponent, SearchResultsComponent, AutoCompleteModule, FormsModule, Fluid],
    templateUrl: 'dashboard.component.html'
})
export class Dashboard {
    private readonly _ecfrStore = inject(EcfrStore);

    agencies: Signal<Agency[]> = this._ecfrStore.agencies;
    titles = this._ecfrStore.titles;
    chapters = this._ecfrStore.chapters;
    selectedAgency = this._ecfrStore.selectedAgency;

    autoFilteredValue: any[] = [];

    constructor() {
        effect(() => {
            this.autoFilteredValue = this.agencies();
        });
    }

    filterAgency(event: AutoCompleteCompleteEvent) {
        const filtered: any[] = [];
        const query = event.query;

        for (let i = 0; i < this.agencies().length; i++) {
            const agency = this.agencies()[i];
            if (agency.display_name.toLowerCase().includes(query.toLowerCase())) {
                filtered.push(agency);
            }
        }

        this.autoFilteredValue = filtered;
    }

    setSelectedAgency($event: Agency) {
        this._ecfrStore.setSelectedAgency($event);

        $event?.cfr_references.forEach((r) => {
            if (!this.chapters().find((x) => x.name === r.chapter && x.title === r.title)) {
                this._ecfrStore.getXml(this.titles().find((t) => t.number === r.title)!.latest_issue_date, r.title, r.chapter);
                this._ecfrStore.getCorrectionsForTitle(r.title);
            }
        });
    }
}
