export interface IContext {
    entries: Array<{
        text?: string;
        type?: string;
    }>;
}
export interface IAnalysisResults {
    attributeScores: {
        [attribute: string]: {
            summaryScore: {
                value: string;
            };
        };
    };
}
export interface IAttributeScores {
    [attribute: string]: number;
}
export interface IClientOptions {
    attributes?: string[];
    context?: IContext;
    doNotStore?: boolean;
    languages?: string[];
    stripHtml?: boolean;
}
export declare class Client {
    private apiKey;
    private perspectiveApiUrl;
    constructor(apiKey: string);
    getScores(text: string, options?: IClientOptions): Promise<IAttributeScores>;
}
