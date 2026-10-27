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
        className="connector-icon"
        src={connector.icon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  return (
    <span className="connector-icon connector-icon-fallback" aria-hidden="true">
      {fallback}
    </span>
  );
}
