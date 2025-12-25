import React from 'react'

export default function ColoredArrow({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_36_1020)">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.717285 26.7968L35.5815 53.1993V0.394043L0.717285 26.7968ZM40.8811 60.394L60.7173 45.3719L40.8811 30.3499V60.394Z" fill="#FFC31B" />
                <path fillRule="evenodd" clipRule="evenodd" d="M40.8811 60.3942L60.7173 45.3721L40.8811 30.3501V60.3942Z" fill="#FF2C00" />
            </g>
            <defs>
                <clipPath id="clip0_36_1020">
                    <rect width="60" height="60" fill="white" transform="translate(0.717285 0.394043)" />
                </clipPath>
            </defs>
        </svg>

    )
}
