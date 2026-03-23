export default function AiaLogo({ size = 32, color = 'currentColor', className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * (48 / 58)}
      viewBox="0 0 58 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="aia-base"><rect x="0" y="0" width="58" height="46" /></clipPath>
      </defs>
      <g clipPath="url(#aia-base)">
        <polyline
          points="2,48 20,5 38,48"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <polyline
          points="20,48 38,5 56,48"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      </g>
      <circle cx="29" cy="5" r="2.2" fill={color} />
    </svg>
  )
}
