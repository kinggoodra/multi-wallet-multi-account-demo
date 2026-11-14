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
        className="size-[33px] flex-none rounded-[10px] bg-white/[.05] object-contain p-[5px]"
        alt=""
        aria-hidden="true"
      />
    );
  }

  return (
    <span className="grid size-[33px] flex-none place-items-center rounded-[10px] bg-white/[.05] p-[5px] font-bold text-[#b5d76c]" aria-hidden="true">
      {fallback}
    </span>
  );
}
