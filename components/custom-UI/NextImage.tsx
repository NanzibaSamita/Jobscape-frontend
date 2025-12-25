"use client";

import Image from 'next/image';
import React from 'react'

export default function NextImage({
    src = "/images/placeholder.png",
    alt = "User Icon",
    width = 64,
    height = 64,
    className = "w-full h-full object-cover",
}: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
}) {
    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={(e) => {
                e.currentTarget.src = '/images/placeholder.png'; // Fallback image
            }}
        />
    )
}
