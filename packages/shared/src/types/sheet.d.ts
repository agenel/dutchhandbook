export type CefrLevel = 'A1' | 'A2' | 'B1';
export interface SheetMeta {
    slug: string;
    title: string;
    description: string;
    level: CefrLevel;
    order: number;
    icon: string;
    footer: string;
    category: string;
    stripe: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    prev?: string;
    next?: string;
}
export declare const SHEET_REGISTRY: SheetMeta[];
export declare function getSheet(slug: string): SheetMeta | undefined;
