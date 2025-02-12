import {patchState, signalStore, withHooks, withMethods, withState} from '@ngrx/signals';
import {Agency} from '../models/agency';
import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import { parseString } from 'xml2js';
import {Title} from '../models/title';
import {Chapter} from '../models/chapter';
import {firstValueFrom} from 'rxjs';
import {Correction} from "../models/ecfr-correction";
import {DailyResult} from "../models/daily-result";
import {TitleResult} from "../models/title-result";

type EcfrState = {
    agencies: Agency[];
    selectedAgency: Agency | null;
    titles: Title[];
    chapters: Chapter[];
    ecfrCorrections: Correction[];
    dailySearchResults: DailyResult | null;
    titleSearchResults: TitleResult | null;
    querySearchResults: any;
};

const initialState: EcfrState = {
    agencies: [],
    selectedAgency: null,
    titles: [],
    chapters: [],
    ecfrCorrections: [],
    dailySearchResults: null,
    titleSearchResults: null,
    querySearchResults: null
};

export const EcfrStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((state, _http = inject(HttpClient)) => ({
        getXml: (date: string, title: number, chapter: string) => {
            if (!state.chapters().find(x => x.name === chapter && x.title === title)) {
                _http.get(`api/text/${date}/${title}/${chapter}`).subscribe({
                    next: (xmlData) => {
                        const callback = (err: any, result: any): void => {
                            if (err) {
                                console.error('Error parsing XML:', err);
                            }

                            let words: string = '';
                            let targetChapter = chapter; // The chapter you're looking for

                            function extractWords(obj: any) {
                                if (Array.isArray(obj)) {
                                    obj.forEach(extractWords);
                                } else if (typeof obj === 'object') {
                                    if (obj['$'] && obj['$'].N === targetChapter && obj['$'].TYPE === 'CHAPTER') {
                                        // We're in the correct chapter, look for P elements
                                        findPInChapter(obj);
                                    } else {
                                        // Continue searching in other parts of the document
                                        for (let key in obj) {
                                            if (obj.hasOwnProperty(key)) {
                                                extractWords(obj[key]);
                                            }
                                        }
                                    }
                                }
                            }

                            function findPInChapter(chapterObj: any) {
                                if (Array.isArray(chapterObj)) {
                                    chapterObj.forEach(findPInChapter);
                                } else if (typeof chapterObj === 'object') {
                                    if (chapterObj.P) {
                                        if (Array.isArray(chapterObj.P)) {
                                            chapterObj.P.forEach((p: any) => {
                                                if (typeof p === 'string') {
                                                    words += ' ' + p.split(/\s+/).join(' ');
                                                } else {
                                                    words += ' ' + extractText(p).split(/\s+/).join(' ');
                                                }
                                            });
                                        } else if (typeof chapterObj.P === 'string') {
                                            words += ' ' + chapterObj.P.split(/\s+/).join(' ');
                                        } else if (typeof chapterObj.P === 'object') {
                                            words += ' ' + extractText(chapterObj.P).split(/\s+/).join(' ');
                                        }
                                    }
                                    for (let key in chapterObj) {
                                        if (chapterObj.hasOwnProperty(key)) {
                                            findPInChapter(chapterObj[key]);
                                        }
                                    }
                                }
                            }

                            // Helper function to extract text from nested objects
                            function extractText(obj: any): string {
                                if (typeof obj === 'string') {
                                    return obj;
                                } else if (typeof obj === 'object') {
                                    let text = '';
                                    for (let key in obj) {
                                        if (obj.hasOwnProperty(key)) {
                                            text += ' ' + extractText(obj[key]);
                                        }
                                    }
                                    return text.trim();
                                }
                                return '';
                            }

                            extractWords(result);

                            // Trim any leading space and reduce multiple spaces to one
                            words = words.trim().replace(/\s+/g, ' ');

                            patchState(state, { chapters: [...state.chapters(), { name: chapter, title: title, content: words }] });
                        }
                        parseString(xmlData, callback);
                    },
                    error: (error) => {
                        console.error('Error fetching XML:', error);
                    }
                });
            }
        },
        getCorrectionsForTitle: async (title: number) => {
            if (!state.ecfrCorrections().find(x => x.title.number === title)) {
                const corrections = await firstValueFrom(_http.get(`api/corrections/${title}`));

                const correctionsWithTitle = (corrections as any).ecfr_corrections.map((c: any) => {
                    return {
                        ...c,
                        title: state.titles().find(x => x.number === title)
                    };
                });

                patchState(state, { ecfrCorrections: [...state.ecfrCorrections(), ...correctionsWithTitle] });
            }
        },
        getDailySearchResults: async (slug: string) => {
            const results = await firstValueFrom(_http.get(`api/search/daily/${slug}`)) as any;
            patchState(state, { dailySearchResults: { dates: results.dates, agency: state.selectedAgency()! } });
        },
        getTitleSearchResults: async (slug: string) => {
            const results = await firstValueFrom(_http.get(`api/search/titles/${slug}`)) as any;
            patchState(state, { titleSearchResults: { titles: results.titles, agency: state.selectedAgency()! } });
        },
        searchCfr: async (query: string) => {
            const results = await firstValueFrom(_http.get(`api/search/results/${state.selectedAgency()!.slug}/${query}`)) as any;
            patchState(state, { querySearchResults: results });
        },
        setSelectedAgency: (agency: Agency) => {
            patchState(state, { selectedAgency: agency, querySearchResults: null });
        }
    })),
    withHooks({
        async onInit(state, _http = inject(HttpClient)) {
            const agencies = await firstValueFrom(_http.get('api/agencies'));
            patchState(state, { agencies: (agencies as any).agencies });

            patchState(state, { selectedAgency: state.agencies()[0] });

            const titles = await firstValueFrom(_http.get('api/titles'));
            patchState(state, { titles: (titles as any).titles });
        }
    })
);
