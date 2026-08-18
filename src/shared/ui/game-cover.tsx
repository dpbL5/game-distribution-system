/**
 * Deterministic artwork placeholder for a game cover.
 * Picks one of the design-system cover gradients from a stable hash of the
 * game name, so the same game always renders the same cover.
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
  className?: string;
  role?: string;
  label?: string;
};

export function GameCover({ name, className, role = "img", label }: GameCoverProps) {
  return (
    <div className={`game-cover ${artClass(name)} ${className ?? ""}`.trim()} role={role} aria-label={label ?? `Ảnh bìa ${name}`}>
      {name}
    </div>
  );
}
