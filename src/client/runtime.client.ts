import { Flamework } from "@flamework/core";

print(`[Oath] client runtime starting — placeId=${game.PlaceId}`);

const [ok, err] = pcall(() => {
	Flamework.addPaths("src/client/components");
	Flamework.addPaths("src/client/controllers");
	Flamework.addPaths("src/shared/components");
	Flamework.ignite();
});

if (!ok) {
	warn(`[Oath] Flamework ignition FAILED: ${tostring(err)}`);
} else {
	print("[Oath] client runtime ignited");
}
