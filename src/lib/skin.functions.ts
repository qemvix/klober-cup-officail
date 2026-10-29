import { createServerFn } from "@tanstack/react-start";

/** Looks up a Minecraft player's current skin texture id from Mojang. */
export const resolveSkin = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string }) => {
    if (!/^[A-Za-z0-9_]{1,16}$/.test(d.name)) throw new Error("Invalid Minecraft name");
    return d;
  })
  .handler(async ({ data }) => {
    try {
      const prof = await fetch(`https://api.mojang.com/users/profiles/minecraft/${data.name}`);
      if (!prof.ok) return { skin: null };
      const { id } = (await prof.json()) as { id: string };
      const sess = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`);
      if (!sess.ok) return { skin: null };
      const j = (await sess.json()) as { properties: { value: string }[] };
      const tex = JSON.parse(atob(j.properties[0]!.value)) as { textures?: { SKIN?: { url: string } } };
      const url = tex.textures?.SKIN?.url;
      return { skin: url ? url.split("/").pop()! : null };
    } catch {
      return { skin: null };
    }
  });
