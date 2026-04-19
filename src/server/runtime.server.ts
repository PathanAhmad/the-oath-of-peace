import { Flamework } from "@flamework/core";

print(`[Oath] server runtime starting — placeId=${game.PlaceId}`);

const [ok, err] = pcall(() => {
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.addPaths("src/shared/components");
	Flamework.ignite();
});

if (!ok) {
	warn(`[Oath] Flamework ignition FAILED: ${tostring(err)}`);
} else {
	print("[Oath] server runtime ignited");
}
