interface SAMapProps {
  width?: number;
  height?: number;
  colour?: string;
}

export default function SAMap({ width = 48, height = 48, colour = '#F5A623' }: SAMapProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.7 }}
    >
      <path
        d="M60 10 L90 8 L120 12 L150 20 L170 35 L185 55 L190 80 L185 105 L175 125 L160 140 L140 150 L120 155 L100 160 L80 158 L60 150 L45 138 L30 120 L20 100 L15 80 L18 60 L25 42 L38 25 L60 10 Z M95 95 L105 90 L115 95 L110 108 L100 112 L90 108 L95 95 Z"
        fill={colour}
        fillOpacity={0.3}
        stroke={colour}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
