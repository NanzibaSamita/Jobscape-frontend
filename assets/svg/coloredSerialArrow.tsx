import React from 'react'

export default function ColoredSerialArrow({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_36_1001)">
                <path fillRule="evenodd" clipRule="evenodd" d="M25.9173 25.594L51.1173 0.394043H0.717285V50.794L25.9173 25.594ZM60.7173 9.99404L35.5173 36.394L60.7173 60.394V9.99404Z" fill="#0D5C91" />
                <path fillRule="evenodd" clipRule="evenodd" d="M60.7172 9.99414L35.5172 36.3941L60.7172 60.3941V9.99414Z" fill="#FFC31B" />
            </g>
            <defs>
                <clipPath id="clip0_36_1001">
                    <rect width="60" height="60" fill="white" transform="translate(0.717285 0.394043)" />
                </clipPath>
            </defs>
        </svg>

    )
}
