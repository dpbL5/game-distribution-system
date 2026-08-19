/**
 * Deterministic artwork placeholder for a game cover.
 * Picks one of the design-system cover gradients from a stable hash of the
 * game name, so the same game always renders the same cover.
 * When coverPath is available (from media storage), renders the real image.
 */
function artClass(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return `art-${hash % 8}`;
}

type GameCoverProps = {
  name: string;
  coverPath?: string | null;
  className?: string;
  role?: string;
  label?: string;
};

export function GameCover({ name, coverPath, className, role = "img", label }: GameCoverProps) {
  if (coverPath) {
    return (
      <div className={`game-cover ${className ?? ""}`.trim()} role={role} aria-label={label ?? `Ảnh bìa ${name}`}>
        <img src={`/api/media/${coverPath}`} alt={label ?? name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
      </div>
    );
  }
  return (
    <div className={`game-cover ${artClass(name)} ${className ?? ""}`.trim()} role={role} aria-label={label ?? `Ảnh bìa ${name}`}>
      {name}
    </div>
  );
}
