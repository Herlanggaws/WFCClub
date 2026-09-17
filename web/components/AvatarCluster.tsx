import { Avatar } from "./Avatar";

interface AvatarPerson {
  initials: string;
  avatarHue: number;
  id: string;
}

interface AvatarClusterProps {
  people: AvatarPerson[];
  totalCount: number;
  maxVisible?: number;
}

export function AvatarCluster({
  people,
  totalCount,
  maxVisible = 3,
}: AvatarClusterProps) {
  const visible = people.slice(0, maxVisible);
  const overflow = Math.max(totalCount - visible.length, 0);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center">
        {visible.map((person, index) => (
          <div
            key={person.id}
            className="relative"
            style={{
              marginLeft: index === 0 ? 0 : -10,
              zIndex: visible.length - index,
            }}
          >
            <Avatar
              initials={person.initials}
              hue={person.avatarHue}
              size="md"
            />
          </div>
        ))}
      </div>
      {overflow > 0 ? (
        <span className="text-sm font-semibold text-muted">+{overflow}</span>
      ) : null}
    </div>
  );
}
