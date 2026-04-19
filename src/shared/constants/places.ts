export const PLACES = {
	hub: 93283527222699,
	match: 83002760593219,
} as const;

export type PlaceKey = keyof typeof PLACES;

export function getPlaceKey(placeId: number): PlaceKey | undefined {
	for (const [key, id] of pairs(PLACES)) {
		if (id === placeId) return key as PlaceKey;
	}
	return undefined;
}
