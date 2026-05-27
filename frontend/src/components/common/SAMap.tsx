import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface SAFlagProps {
  width?: number;
  height?: number;
}

export default function SAFlag({ width = 60, height = 40 }: SAFlagProps) {
  const flagRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!flagRef.current) return;

    const stripes = flagRef.current.querySelectorAll('.flag-stripe');

    anime({
      targets: stripes,
      d: [
        { value: (el: SVGElement) => el.getAttribute('data-wave1') },
        { value: (el: SVGElement) => el.getAttribute('data-original') },
      ],
      easing: 'easeInOutSine',
      duration: 2000,
      delay: anime.stagger(80),
      loop: true,
      direction: 'alternate',
    });

    // Subtle overall sway
    anime({
      targets: flagRef.current,
      rotate: ['-1deg', '1deg'],
      easing: 'easeInOutSine',
      duration: 3000,
      loop: true,
      direction: 'alternate',
    });
  }, []);

  // SA flag: 6 horizontal bands + Y-shape
  // Proportions: width=3, height=2
  const w = 90;
  const h = 60;

  return (
    <svg
      ref={flagRef}
      width={width}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ transformOrigin: 'left center', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
    >
      {/* Red top half background */}
      <path
        className="flag-stripe"
        d={`M0,0 L${w},0 L${w},${h / 2} L0,${h / 2} Z`}
        data-original={`M0,0 L${w},0 L${w},${h / 2} L0,${h / 2} Z`}
        data-wave1={`M0,0 L${w},1 L${w},${h / 2 + 1} L0,${h / 2 - 1} Z`}
        fill="#DE3831"
      />
      {/* Blue bottom half background */}
      <path
        className="flag-stripe"
        d={`M0,${h / 2} L${w},${h / 2} L${w},${h} L0,${h} Z`}
        data-original={`M0,${h / 2} L${w},${h / 2} L${w},${h} L0,${h} Z`}
        data-wave1={`M0,${h / 2 - 1} L${w},${h / 2 + 1} L${w},${h + 1} L0,${h - 1} Z`}
        fill="#002395"
      />
      {/* White stripe top */}
      <path
        className="flag-stripe"
        d={`M0,${h * 0.15} L30,${h * 0.15} L50,${h * 0.33} L${w},${h * 0.33} L${w},${h * 0.4} L50,${h * 0.4} L30,${h * 0.22} L0,${h * 0.22} Z`}
        data-original={`M0,${h * 0.15} L30,${h * 0.15} L50,${h * 0.33} L${w},${h * 0.33} L${w},${h * 0.4} L50,${h * 0.4} L30,${h * 0.22} L0,${h * 0.22} Z`}
        data-wave1={`M0,${h * 0.14} L30,${h * 0.16} L50,${h * 0.34} L${w},${h * 0.32} L${w},${h * 0.39} L50,${h * 0.41} L30,${h * 0.23} L0,${h * 0.21} Z`}
        fill="#FFFFFF"
      />
      {/* White stripe bottom */}
      <path
        className="flag-stripe"
        d={`M0,${h * 0.78} L30,${h * 0.78} L50,${h * 0.6} L${w},${h * 0.6} L${w},${h * 0.67} L50,${h * 0.67} L30,${h * 0.85} L0,${h * 0.85} Z`}
        data-original={`M0,${h * 0.78} L30,${h * 0.78} L50,${h * 0.6} L${w},${h * 0.6} L${w},${h * 0.67} L50,${h * 0.67} L30,${h * 0.85} L0,${h * 0.85} Z`}
        data-wave1={`M0,${h * 0.77} L30,${h * 0.79} L50,${h * 0.61} L${w},${h * 0.59} L${w},${h * 0.66} L50,${h * 0.68} L30,${h * 0.86} L0,${h * 0.84} Z`}
        fill="#FFFFFF"
      />
      {/* Green Y-shape */}
      <path
        className="flag-stripe"
        d={`M0,${h * 0.22} L30,${h * 0.22} L50,${h * 0.4} L${w},${h * 0.4} L${w},${h * 0.6} L50,${h * 0.6} L30,${h * 0.78} L0,${h * 0.78} L0,${h * 0.65} L20,${h * 0.65} L42,${h * 0.5} L20,${h * 0.35} L0,${h * 0.35} Z`}
        data-original={`M0,${h * 0.22} L30,${h * 0.22} L50,${h * 0.4} L${w},${h * 0.4} L${w},${h * 0.6} L50,${h * 0.6} L30,${h * 0.78} L0,${h * 0.78} L0,${h * 0.65} L20,${h * 0.65} L42,${h * 0.5} L20,${h * 0.35} L0,${h * 0.35} Z`}
        data-wave1={`M0,${h * 0.21} L30,${h * 0.23} L50,${h * 0.41} L${w},${h * 0.39} L${w},${h * 0.59} L50,${h * 0.61} L30,${h * 0.79} L0,${h * 0.77} L0,${h * 0.64} L20,${h * 0.66} L42,${h * 0.51} L20,${h * 0.34} L0,${h * 0.34} Z`}
        fill="#007A4D"
      />
      {/* Black triangle on left */}
      <path
        className="flag-stripe"
        d={`M0,0 L0,${h} L20,${h * 0.65} L42,${h * 0.5} L20,${h * 0.35} L0,0 Z`}
        data-original={`M0,0 L0,${h} L20,${h * 0.65} L42,${h * 0.5} L20,${h * 0.35} L0,0 Z`}
        data-wave1={`M0,0 L0,${h + 1} L20,${h * 0.66} L42,${h * 0.51} L20,${h * 0.34} L0,-1 Z`}
        fill="#000000"
      />
      {/* Gold/yellow border around black triangle */}
      <path
        className="flag-stripe"
        d={`M0,${h * 0.15} L20,${h * 0.35} L42,${h * 0.5} L20,${h * 0.65} L0,${h * 0.85}`}
        data-original={`M0,${h * 0.15} L20,${h * 0.35} L42,${h * 0.5} L20,${h * 0.65} L0,${h * 0.85}`}
        data-wave1={`M0,${h * 0.14} L20,${h * 0.34} L42,${h * 0.51} L20,${h * 0.66} L0,${h * 0.84}`}
        fill="none"
        stroke="#FFB612"
        strokeWidth="2"
      />
    </svg>
  );
}
