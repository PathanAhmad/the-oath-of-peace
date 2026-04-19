/**
 * Character appearance — what the Galactic Guardian looks like.
 * Every player uses an R15 rig we assemble server-side; their Roblox-account
 * avatar is ignored entirely.
 */
export interface Appearance {
	hairId: string;
	shirtId: string;
	pantsId: string;
	skinToneId: SkinToneId;
}

export type SkinToneId = "pale" | "tan" | "brown" | "dark";

export const SKIN_TONES: Record<SkinToneId, Color3> = {
	pale: Color3.fromRGB(242, 220, 196),
	tan: Color3.fromRGB(204, 161, 122),
	brown: Color3.fromRGB(148, 96, 64),
	dark: Color3.fromRGB(74, 48, 36),
};

/**
 * Free Roblox-catalog assets used as default options. Replace with custom
 * Galactic Guardian assets once art pipeline catches up.
 */
export interface AppearanceOption {
	id: string;
	label: string;
	assetId: number;
	thumbnail?: number;
}

export const HAIR_OPTIONS: readonly AppearanceOption[] = [
	{ id: "buzzcut", label: "Buzzcut", assetId: 16627529 },
	{ id: "short-brown", label: "Short Brown", assetId: 48474294 },
	{ id: "messy-black", label: "Messy Black", assetId: 28348143 },
	{ id: "ponytail", label: "Ponytail", assetId: 376521898 },
	{ id: "spiked", label: "Spiked", assetId: 16630147 },
] as const;

export const SHIRT_OPTIONS: readonly AppearanceOption[] = [
	{ id: "guardian-navy", label: "Guardian Navy", assetId: 607785311 },
	{ id: "guardian-grey", label: "Guardian Grey", assetId: 4838588742 },
	{ id: "recon-camo", label: "Recon Camo", assetId: 1814010927 },
	{ id: "vanguard-heavy", label: "Vanguard Heavy", assetId: 4730960820 },
] as const;

export const PANTS_OPTIONS: readonly AppearanceOption[] = [
	{ id: "tactical-navy", label: "Tactical Navy", assetId: 607785955 },
	{ id: "tactical-grey", label: "Tactical Grey", assetId: 4838591330 },
	{ id: "recon-camo", label: "Recon Camo", assetId: 1814012124 },
	{ id: "vanguard-heavy", label: "Vanguard Heavy", assetId: 4730963569 },
] as const;

export const DEFAULT_APPEARANCE: Appearance = {
	hairId: HAIR_OPTIONS[0].id,
	shirtId: SHIRT_OPTIONS[0].id,
	pantsId: PANTS_OPTIONS[0].id,
	skinToneId: "tan",
};

export function resolveAsset(options: readonly AppearanceOption[], id: string): AppearanceOption | undefined {
	return options.find((o) => o.id === id);
}
