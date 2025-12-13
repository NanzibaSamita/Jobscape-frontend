"use client";
import React from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";

export default function AutoSlider({
    content,
}: {
    content: { image: string; title: string }[];
}) {
    return (
        <div className="z-50">
            <Marquee
                className="w-full"
                speed={50}
                pauseOnHover={true}
                gradient={false}
                autoFill={true}
            >
                <div className="flex items-center gap-8">
                    {content.map((src, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-start gap-3 mx-4"
                        >
                            <div className="w-10 h-10">
                                <Image
                                    src={src.image}
                                    alt={src.title}
                                    width={0}
                                    height={0}
                                    quality={100}
                                    sizes="100vw"
                                    className="object-cover rounded-2xl transition-all duration-500 ease-in-out"
                                    style={{ width: "100%", height: "100%" }}
                                />
                            </div>
                            <p className="text-white py-2 px-3 bg-black rounded-xl whitespace-nowrap">
                                {src.title}
                            </p>
                        </div>
                    ))}
                </div>
            </Marquee>
        </div>
    );
}