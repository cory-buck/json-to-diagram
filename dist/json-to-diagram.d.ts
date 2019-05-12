export interface Json {
    [prop: string]: string | number | Json;
}
export declare function jsonToDiagram(target: HTMLElement, json: Json): void;
