import {Component, computed, inject} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import {EcfrStore} from "../../../stores/ecfr.store";
import {Correction} from "../../../models/ecfr-correction";
import {CommonModule} from "@angular/common";

@Component({
    standalone: true,
    selector: 'app-corrections',
    imports: [ButtonModule, MenuModule, CommonModule],
    templateUrl: './corrections.component.html',
})
export class CorrectionsComponent {
    private readonly _ecfrStore = inject(EcfrStore);

    selectedAgency = this._ecfrStore.selectedAgency;
    corrections = this._ecfrStore.ecfrCorrections;

    correctionsGroupedByMonthAndYear = computed(() => {
        return this.corrections().reduce((acc, correction) => {
            const date = new Date(correction.error_corrected);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(correction);
            return acc;
        }, {} as Record<string, Correction[]>);
    });

    correctionsSorted = computed(() => {
        return Object.entries(this.correctionsGroupedByMonthAndYear())
            .sort(([keyA], [keyB]) => new Date(keyB).getTime() - new Date(keyA).getTime())
            .map(([key, corrections]) => {
                const [year, month] = key.split('-').map(Number);
                const date = new Date(year, month);
                const monthName = date.toLocaleString('default', { month: 'long' });
                return {
                    monthYear: `${monthName} ${year}`,
                    corrections
                };
            });
    });
}
