import {Component, inject, signal} from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import {EcfrStore} from "../../../stores/ecfr.store";
import {Dialog} from "primeng/dialog";
import {Chapter} from "../../../models/chapter";

@Component({
    standalone: true,
    selector: 'app-cfr-references',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, Dialog],
    templateUrl: 'cfr-references.component.html'
})
export class CfrReferencesComponent {
    private readonly _ecfrStore = inject(EcfrStore);

    selectedAgency = this._ecfrStore.selectedAgency;
    chapters = this._ecfrStore.chapters;

    displayDialog = signal(false);
    selectedChapter = signal<Chapter | null | undefined>(null);

    open(reference: any) {
        this.displayDialog.set(true);
        const chapter = this.chapters().find(chapter => chapter.title === reference.title && chapter.name === reference.chapter);
        this.selectedChapter.set(chapter);
    }

    close() {
        this.displayDialog.set(false);
    }
}
