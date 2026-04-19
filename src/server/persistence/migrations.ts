import { DEFAULT_APPEARANCE } from "shared/types/Appearance";
import { ProfileData } from "shared/types/Profile";

/**
 * Run profile migrations in order. ProfileStore calls `Reconcile()` before
 * this runs, which fills in missing fields from the current template — but
 * Reconcile alone can't rename fields or handle structural changes, so any
 * real migration work lives here.
 */
export function runProfileMigrations(data: unknown): ProfileData {
	// ProfileStore guarantees we were given a table, but treat as unknown at first.
	const d = data as Partial<ProfileData> & { schemaVersion?: number };

	if (!d.schemaVersion || d.schemaVersion < 2) {
		migrateV1ToV2(d);
	}

	d.schemaVersion = 2;
	return d as ProfileData;
}

function migrateV1ToV2(d: Partial<ProfileData> & { schemaVersion?: number }) {
	if (d.appearance === undefined) {
		// Deep copy — never share the default reference across profiles.
		d.appearance = {
			hairId: DEFAULT_APPEARANCE.hairId,
			shirtId: DEFAULT_APPEARANCE.shirtId,
			pantsId: DEFAULT_APPEARANCE.pantsId,
			skinToneId: DEFAULT_APPEARANCE.skinToneId,
		};
	}
}
