import Link from 'next/link';
import { } from 'react';
import ActionButtons from './ActionButtons';
import Image from 'next/image';
import bannerImage from '../../public/images/hero-banner1.png'; // Adjust the path as necessary
import { GradientText } from '@/components/shared/GradientText';
import NextImage from '@/components/custom-UI/NextImage';
import HireButton from './HireButton';

export default function Banner() {
    return (
        <div className='gradientBackground container-padding'>
            <div className='h-[5rem] flex items-center justify-between pt-4 border-b border-[#A7A7A7]/20'>
                <NextImage
                    src="/images/wai-white.png"
                    alt="Wanted.AI Logo"
                    width={100}
                    height={50}
                    className="h-8 w-auto"
                />
                <nav className="hidden md:hidden items-center space-x-6">
                    <Link href="#features" className="text-xs text-[#A7A7A7] hover:text-white">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-xs text-[#A7A7A7] hover:text-white">
                        How it works
                    </Link>
                    <Link href="#pricing" className="text-xs text-[#A7A7A7] hover:text-white">
                        Pricing
                    </Link>
                    <Link href="#company" className="text-xs text-[#A7A7A7] hover:text-white">
                        Company
                    </Link>
                    <Link href="#recourse" className="text-xs text-[#A7A7A7] hover:text-white">
                        Recourse
                    </Link>
                </nav>
                <ActionButtons />
            </div>
            <section className='mx-auto py-12 md:py-32 '>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
                    <div className="space-y-6">
                        <div className="relative">
                            <div className="absolute -left-10 -top-10 lg:block hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="69" viewBox="0 0 115 69" fill="none">
                                    <g clipPath="url(#clip0_36_638)">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M94.414 14.8258C93.7536 13.654 92.9772 12.5533 92.1115 11.5318C96.0159 3.73351 104.963 0.511137 112.852 4.12191C113.414 4.37828 114.075 4.13043 114.334 3.56889C114.588 3.00736 114.343 2.34336 113.78 2.08699C105.026 -1.92026 95.119 1.43779 90.4917 9.81599C89.6528 9.01326 88.7515 8.27323 87.8055 7.60028C78.9615 1.31381 65.9363 3.35277 55.9499 12.752C52.8487 15.6724 51.0148 21.3906 50.0509 27.861C48.9667 35.1362 48.9175 43.3587 49.0469 49.2989C47.7708 45.9409 46.2357 42.7306 44.5624 39.5247C44.0728 38.5869 43.5841 37.6453 43.0945 36.7017C37.207 25.3568 31.1718 13.7271 21.5197 5.13759C21.0556 4.72773 20.3506 4.76979 19.9445 5.23153C19.5339 5.69333 19.5786 6.40113 20.0382 6.81055C29.4221 15.1635 35.2827 26.4747 41.0031 37.5156C41.5309 38.5343 42.0576 39.5507 42.5856 40.5623C44.5535 44.331 46.325 48.1042 47.6949 52.1307C47.747 52.2826 47.7992 52.4343 47.8514 52.5861C48.2107 53.6306 48.569 54.6722 48.8729 55.7356C48.9103 55.8686 48.8955 56.0503 48.88 56.2382C48.8734 56.3191 48.8667 56.4012 48.864 56.4811C48.855 56.8637 48.8729 57.2225 48.9398 57.4802C49.0648 57.9469 49.3325 58.2494 49.6583 58.4212C49.8992 58.5465 50.1982 58.618 50.573 58.5509C50.8318 58.5017 51.2022 58.372 51.4119 57.8726C51.4565 57.7711 51.5368 57.2628 51.5145 56.4064C51.5018 55.9553 51.4787 55.3625 51.4508 54.6493C51.2649 49.8797 50.8688 39.7223 51.9518 30.5026C52.7505 23.6958 54.2855 17.3869 57.476 14.3829C66.5923 5.80295 78.4394 3.68698 86.516 9.42536C87.6003 10.1958 88.6132 11.0625 89.5369 12.0182C89.1933 13.5413 89.0951 16.2102 89.7511 17.9566C90.0947 18.8702 90.639 19.5517 91.3351 19.8984C92.058 20.2595 92.9951 20.3217 94.1686 19.7248C95.0521 19.2747 95.3957 18.4201 95.3065 17.4071C95.2262 16.4563 94.7085 15.3475 94.414 14.8258ZM92.473 15.9279C92.1606 15.3793 91.826 14.8487 91.4645 14.3368C91.4378 15.301 91.5359 16.365 91.8393 17.1677C91.9598 17.4877 92.0848 17.774 92.3302 17.8957C92.5266 17.9946 92.7675 17.9212 93.0754 17.7691C93.0754 17.6751 93.071 17.472 93.0442 17.3422C92.9237 16.7883 92.6381 16.2223 92.473 15.9279ZM41.9786 18.3176C40.524 13.3176 37.6592 9.40613 33.2684 6.58148C32.7508 6.24815 32.5991 5.55553 32.9338 5.03605C33.264 4.51658 33.9556 4.36534 34.4732 4.69868C39.3326 7.82624 42.5097 12.1547 44.1205 17.6908C44.2945 18.2832 43.9509 18.9052 43.3619 19.0779C42.7685 19.251 42.1482 18.91 41.9786 18.3176ZM22.3318 44.068C26.5173 45.1548 29.98 47.3477 33.1526 50.2748C33.6033 50.6927 34.3128 50.6627 34.7277 50.2086C35.1472 49.754 35.1159 49.0457 34.6608 48.6278C31.2115 45.447 27.441 43.0836 22.8895 41.9024C22.2961 41.7476 21.6848 42.1069 21.5286 42.7047C21.3769 43.3024 21.7338 43.9132 22.3318 44.068ZM27.4426 65.1719C29.0442 65.1514 30.6438 65.131 32.2379 65.0924C32.8536 65.0745 33.3445 64.5645 33.3266 63.947C33.3133 63.3295 32.8001 62.8374 32.1843 62.8553C30.6456 62.8923 29.102 62.914 27.5564 62.9357L27.5482 62.9359L27.54 62.9361C18.63 63.0615 9.65503 63.1878 1.17207 66.229C0.592013 66.4392 0.293032 67.079 0.49827 67.6607C0.708041 68.2423 1.3461 68.5421 1.92615 68.3363C10.1339 65.393 18.8182 65.282 27.4426 65.1719Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_36_638">
                                            <rect width="114" height="68" fill="white" transform="translate(0.433594 0.401245)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-medium leading-tight text-white">
                                The Future of Hiring:
                                <br />
                                <GradientText
                                    text={"AI-Curated Talent,"}
                                    gradientClass="from-[#FFC31B] via-[#FF5900] to-[#FF5900]"
                                />
                                <br />
                                Delivered Fast
                            </h1>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Find the latest job opportunities from {" "}
                            <span className="text-yellow-500 font-medium">Bangladesh and across the globe</span> all in one place.
                            Apply in seconds with our AI-powered platform built for speed, simplicity, and results.
                        </p>
                        <HireButton />
                    </div>

                    <div className="h-0 ml-auto w-0 lg:mt-0 lg:block hidden">
                        <div className="w-0">
                            <Image
                                src={bannerImage}
                                alt="Person using the app"
                                width={500}
                                height={600}
                                className="mx-auto absolute right-0 top-0 translate-x-10 -translate-y-14 blur-mask"
                            />

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};