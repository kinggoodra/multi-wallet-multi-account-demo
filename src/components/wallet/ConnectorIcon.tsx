import type { ConnectorWithIcon } from "./types";

export default function ConnectorIcon({
  connector,
}: {
  connector: ConnectorWithIcon;
}) {
  const fallback = connector.name.slice(0, 1).toUpperCase();

  if (connector.icon) {
    return (
      <img
        src={connector.icon}
        className="connector-icon"
        alt=""
        aria-hidden="true"
      />
    );
  }

  return (
    <span className="connector-icon connector-fallback" aria-hidden="true">
      {fallback}
    </span>
  );
}
