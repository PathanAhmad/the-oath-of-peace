export type ClassId = "assault" | "medic" | "engineer" | "recon" | "vanguard";

export const CLASS_IDS: readonly ClassId[] = ["assault", "medic", "engineer", "recon", "vanguard"];

export const CLASS_DISPLAY_NAME: Record<ClassId, string> = {
	assault: "Assault",
	medic: "Medic",
	engineer: "Engineer",
	recon: "Recon",
	vanguard: "Vanguard",
};

export const CLASS_TAGLINE: Record<ClassId, string> = {
	assault: "Generalist rifleman. Reliable damage.",
	medic: "Sustain — heal beam + fastest revive.",
	engineer: "Fortify — turrets and walls.",
	recon: "Long-range pickoff + sword for close quarters.",
	vanguard: "Frontline wall. Flamethrower + gauntlets.",
};
