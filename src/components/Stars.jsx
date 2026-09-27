function Star({ fill }) {
  // fill: 0, 0.5 oder 1
  const id = `starclip-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width="30" height="30" viewBox="0 0 24 24">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path
        d="M12 2.5l2.9 6.1 6.6.7-5 4.6 1.4 6.6L12 17.1l-5.9 3.4L7.5 14l-5-4.6 6.6-.7z"
        fill="none"
        stroke="var(--saffron-dim)"
        strokeWidth="1.4"
      />
      <path
        d="M12 2.5l2.9 6.1 6.6.7-5 4.6 1.4 6.6L12 17.1l-5.9 3.4L7.5 14l-5-4.6 6.6-.7z"
        fill="var(--saffron)"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

export default function Stars({ value = 0, onChange, readOnly = false, size = "md" }) {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (starIndex, e) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    const newValue = isLeftHalf ? starIndex - 0.5 : starIndex;
    onChange(newValue);
  };

  return (
    <div className="stars" style={{ transform: size === "lg" ? "scale(1.3)" : "none", transformOrigin: "left" }}>
      {stars.map((s) => {
        const fill = Math.max(0, Math.min(1, value - (s - 1)));
        return (
          <button
            key={s}
            type="button"
            onClick={(e) => handleClick(s, e)}
            disabled={readOnly}
            style={{ background: "none", border: "none", padding: 0, cursor: readOnly ? "default" : "pointer" }}
            aria-label={`${s} Sterne`}
          >
            <Star fill={fill} />
          </button>
        );
      })}
    </div>
  );
}
