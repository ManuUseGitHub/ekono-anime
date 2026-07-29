export type HistoryEntry = { name: string; origin: string };
export type LogAccepts = "none" | "all" | "loud" | "silent" | "regex" | "history";
export type DynamicObject<T = any> = { [x: string]: T };
export type Summary = {
    history: any[];
    inventory: DynamicObject;
};
export type AparteEnvConfig = {
    production: boolean;
    eventLog?: {
        events: LogAccepts;
        eventsRegex?: string;
        history?: {
            listeners: LogAccepts;
            listenersRegex?: string;
            broadcaster: LogAccepts;
            broadcastersRegex?: string;
        };
    };
};

export interface HasAparteConfig {
    getConfig: () => AparteEnvConfig;
}
