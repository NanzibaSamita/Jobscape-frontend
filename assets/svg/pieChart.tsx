import React from 'react'

export default function PieChart({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_36_994)">
                <path fillRule="evenodd" clipRule="evenodd" d="M55.8466 5.89879C58.0144 8.2175 59.7024 10.9393 60.815 13.9087L38.1357 22.3551L48.182 0.394043C51.0747 1.70922 53.6792 3.57972 55.8466 5.89879ZM52.9793 47.7733C56.1088 43.1036 57.7794 37.6131 57.7794 31.9967H29.2972V3.59948C23.6641 3.59948 18.1571 5.26512 13.4735 8.38528C8.78953 11.5054 5.13886 15.9407 2.98323 21.1297C0.82725 26.3183 0.263309 32.0283 1.36233 37.5368C2.46136 43.0454 5.17397 48.105 9.15737 52.0766C13.1408 56.0481 18.2155 58.7526 23.7406 59.8484C29.2656 60.9441 34.9926 60.3815 40.1967 58.2323C45.4012 56.0831 49.8498 52.4433 52.9793 47.7733Z" fill="#CFCFCF" />
            </g>
            <defs>
                <clipPath id="clip0_36_994">
                    <rect width="60" height="60" fill="white" transform="translate(0.815002 0.394043)" />
                </clipPath>
            </defs>
        </svg>

    )
}
