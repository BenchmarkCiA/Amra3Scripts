interface Props {
  stars: number;
  appName?: string;
}

export function TopBar({ stars, appName = 'Family Quest' }: Props) {
  return (
    <div className="top-bar">
      <div className="logo-badge-group">
        <div className="logo-badge" />
        <div className="app-name">{appName}</div>
      </div>
      <div className="coin-pill">
        <span className="coin-dot" />
        {stars}
      </div>
    </div>
  );
}
