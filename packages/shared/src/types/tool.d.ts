export interface ToolMeta {
    slug: string;
    title: string;
    description: string;
    icon: string;
    tag: string;
}
export declare const TOOL_REGISTRY: ToolMeta[];
export declare function getTool(slug: string): ToolMeta | undefined;
