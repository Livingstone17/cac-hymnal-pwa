
export default function HymnBookLogo({
    size = 40,
    light = false,
}: {
    size?: number;
    light?: boolean;
}) {
    const stroke = light ? "white" : "#1A237E";

    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path
                d="M24 10 C18 10 7 12 5 15 L5 41 C7 38 18 37 24 37"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M24 10 C30 10 41 12 43 15 L43 41 C41 38 30 37 24 37"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line
                x1="24"
                y1="10"
                x2="24"
                y2="37"
                stroke={stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <line
                x1="34.5"
                y1="17"
                x2="34.5"
                y2="33"
                stroke="#D4A017"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <line
                x1="28"
                y1="23"
                x2="41"
                y2="23"
                stroke="#D4A017"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}