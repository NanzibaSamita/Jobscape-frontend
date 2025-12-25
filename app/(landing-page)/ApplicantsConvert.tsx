import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton';
import { Button } from '@/components/ui/button';
import user1 from "@/public/images/user1.png"
import user2 from "@/public/images/user2.png"
import user3 from "@/public/images/user3.png"
import company1 from "@/public/images/company1.png"
import company2 from "@/public/images/company2.png"
import company3 from "@/public/images/company3.png"
import { } from 'react';
import AvatarGroup from './Avaters';
import AutoSlider from './CompanySlider';
import Image from 'next/image';
import map from "@/public/images/Map23.png";
import StackBlocks from './StackBlocks';

export default function ApplicantsConvert() {
    const avatars = [
        {
            id: 1,
            src: user1.src,
            alt: "User 1",
            name: "John Doe",
        },
        {
            id: 2,
            src: user2.src,
            alt: "User 2",
            name: "Jane Smith",
        },
        {
            id: 3,
            src: user3.src,
            alt: "User 3",
            name: "Mike Johnson",
        },
    ]
    return (
        <div className='container-padding mx-auto border border-transparent lg:mt-[5rem] hidden'>
            <section>
                <p className='text-4xl md:text-5xl lg:text-5xl font-medium leading-tight text-[#D9D9D9] text-center'>Attract and convert the right
                    <br />
                    applicants faster
                </p>
                <p className='my-2 text-[#D9D9D9] text-center text-sm'>Source and attract the best-matching talent and grab their attention easily. We give
                    <br />
                    you all the tools for hiring success.</p>
            </section>

            <section className='grid grid-cols-1 lg:grid-cols-[60%_38%] gap-4 mt-16'>
                <div className="border border-slate-500/40 rounded-md w-full flex flex-col justify-between p-8">
                    <div>
                        <p className='text-white text-4xl mb-4'>We reach out to many <span className='text-yellow-400'>industries</span> for job openings.</p>
                        <WhiteStyleButton
                            title="Explore All Companies"
                            customStyles={{
                                text1: {
                                    fontSize: "14px",
                                    fontWeight: "300"
                                },
                                text2: {
                                    fontSize: "14px",
                                    fontWeight: "300"
                                },
                                button: {
                                    padding: "0.1rem 0.5rem"
                                },
                                buttonWrapper: {
                                    minWidth: "180px"
                                }
                            }}
                        />
                    </div>
                    <div className='mt-20'>
                        <AutoSlider
                            content={[
                                {
                                    image: company1.src,
                                    title: "Nexus corp",
                                },
                                {
                                    image: company2.src,
                                    title: "BlazeTech LLC",
                                },
                                {
                                    image: company3.src,
                                    title: "Swift works Inc",
                                },
                            ]}
                        />
                    </div>
                </div>
                <div className="bg-[#FACC14] rounded-md w-full flex flex-col justify-between p-8">
                    <div>
                        <p className='text-black font-bold text-2xl mb-4'>
                            Dream big and dare to believe it
                        </p>
                        <Button className='bg-white text-black rounded-full font-light hover:bg-black hover:text-[#FACC14] transition-colors duration-500 ease-in-out '>
                            Join Us Now
                        </Button>
                    </div>
                    <AvatarGroup title='Trusted by over 1500+ users' avatars={avatars} />
                </div>
            </section>

            <section className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'>
                <div className="w-full border-slate-500/40 rounded-md border p-8">
                    <div>
                        <p className='text-white text-4xl mb-4'>Global job openings in 50+ locations</p>
                        <Button className='bg-white text-black rounded-full font-light hover:bg-black hover:text-[#FACC14] transition-colors duration-500 ease-in-out '>
                            View All Jobs
                        </Button>
                    </div>
                    <div>
                        <Image
                            src={map.src}
                            alt={"World Map"}
                            width={400}
                            height={100}
                            className=""
                        />
                    </div>
                </div>
                <div className="w-full p-8 flex flex-col  border-slate-500/40 rounded-md border">
                    <div>
                        <p className='text-white text-4xl mb-2'>Over <span className='text-yellow-400'>30+ platforms</span> we cover</p>
                        <p className='text-gray-500 font-thin'>Dive into a world of endless possibilities with our platform, covering
                            over 30+ diverse job and career avenues.</p>
                    </div>
                    <div className='flex-grow'>
                        <StackBlocks />
                    </div>
                </div>
            </section>
        </div >
    );
};