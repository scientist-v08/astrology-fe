export interface GeoapifyFeature {
    properties: {
        formatted: string;
        lat: number;
        lon: number;
        timezone?: {
            name?: string;
            offset_STD?: string;
            offset_DST?: string;
            offset_STD_seconds?: number;
            offset_DST_seconds?: number;
        };
    };
}

export interface GeoapifyResponse {
    features: GeoapifyFeature[];
}
