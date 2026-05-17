"use client";

import Link from "next/link";

interface SubnavProps {
  active: "private" | "public";
}

export function Subnav({ active }: SubnavProps) {
  return (
    <div className="subnav" role="tablist">
      <Link
        className={`subnav-btn ${active === "private" ? "is-active is-private" : "is-private"}`}
        href="/private"
        role="tab"
      >
        <span className="dot" />
        Private · LatAm
      </Link>
      <Link
        className={`subnav-btn ${active === "public" ? "is-active is-public" : "is-public"}`}
        href="/public"
        role="tab"
      >
        <span className="dot" />
        Public · US
      </Link>
    </div>
  );
}
