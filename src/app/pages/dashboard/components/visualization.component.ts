import {Component, computed, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {EcfrStore} from "../../../stores/ecfr.store";
import {Button} from "primeng/button";
import {Dialog} from "primeng/dialog";

@Component({
    standalone: true,
    selector: 'app-visualization',
    imports: [CommonModule, Button, Dialog],
    templateUrl: 'visualization.component.html'
})
export class VisualizationComponent {
    private readonly _ecfrStore = inject(EcfrStore);

    selectedAgency = this._ecfrStore.selectedAgency;
    titles = this._ecfrStore.titles;
    chapters = this._ecfrStore.chapters;
    corrections = this._ecfrStore.ecfrCorrections;
    dailySearchResults = this._ecfrStore.dailySearchResults;
    titleSearchResults = this._ecfrStore.titleSearchResults;

    displayDialog = signal(false);

    open() {
        this.displayDialog.set(true);
    }

    close() {
        this.displayDialog.set(false);
    }

    cfr = computed(() => {
        if (!this.selectedAgency() || !this.titles().length) {
            return {
                cfr_references: []
            };
        }

        this.selectedAgency()?.cfr_references?.forEach((r) => {
            if (!this.chapters().find((x) => x.name === r.chapter && x.title === r.title)) {
                this._ecfrStore.getXml(this.titles().find((t) => t.number === r.title)!.latest_issue_date, r.title, r.chapter);
                this._ecfrStore.getCorrectionsForTitle(r.title);
            }
        });

        return {
            cfr_references: this.selectedAgency()?.cfr_references?.map((y) => {
                return {
                    original: y,
                    title: this.titles().find((z) => z.number === y.title),
                    chapter: this.chapters().find((z) => z.name === y.chapter && z.title === y.title)
                };
            })
        };
    });

    correctionsFromCfrReferences = computed(() => {
        if (!this.chapters()?.length) {
            return [];
        }

        return this.cfr().cfr_references?.flatMap((r) => {
            const filtered = this.corrections()
                .filter((c) => c.title === r.title)
                .flatMap((r) => r);
            const references = filtered.flatMap((x) => x?.cfr_references);
            return references.filter((x) => x?.hierarchy.chapter === r.chapter?.name);
        });
    });

    totalCorrections = computed(() => {
        return this.correctionsFromCfrReferences()?.length;
    });

    lastCorrectionDate = computed(() => {
        return this.corrections()?.sort((a, b) => new Date(b.error_corrected).getTime() - new Date(a.error_corrected).getTime())[0]?.error_corrected;
    });

    dailySearchResultsForAgency = computed(() => {
        if (this._ecfrStore.selectedAgency() && this.dailySearchResults()?.agency !== this._ecfrStore.selectedAgency()) {
            this._ecfrStore.getDailySearchResults(this._ecfrStore.selectedAgency()!.slug);
            return [];
        }

        if (!this.dailySearchResults()?.dates) {
            return [];
        }

        return Object.entries(this._ecfrStore.dailySearchResults()?.dates).map(([date, count]) => ({
            date: date,
            count: count
        }));
    });

    mostRecentDailySearchResult = computed(() => {
        return this.dailySearchResultsForAgency()?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    });

    titleSearchResultsForAgency = computed(() => {
        if (this._ecfrStore.selectedAgency() && this.titleSearchResults()?.agency !== this._ecfrStore.selectedAgency()) {
            this._ecfrStore.getTitleSearchResults(this._ecfrStore.selectedAgency()!.slug);
            return [];
        }

        if (!this.titleSearchResults()?.titles) {
            return [];
        }

        return Object.entries(this._ecfrStore.titleSearchResults()?.titles).map(([title, count]) => ({
            title: title,
            count: count
        }));
    });

    mostReferencedTitleSearchResult = computed(() => {
        return this.titleSearchResultsForAgency()?.sort((a, b) => (b.count as number) - (a.count as number))[0];
    });

    totalCfrWordCount = computed(() => {
        return this.cfr().cfr_references?.reduce((acc, curr) => {
            return acc + (curr.chapter?.content.length || 0);
        }, 0);
    });

    totalCfrAllWordsTogether = computed(() => {
        return this.cfr().cfr_references?.reduce((acc, curr) => {
            return acc + (curr.chapter?.content || '');
        }, '');
    })
}
