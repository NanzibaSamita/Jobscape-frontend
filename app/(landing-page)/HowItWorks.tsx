import { } from 'react';
import { Topology, Profile, Search, UserGroup, } from '@/assets/svg/index';
import WhiteHoverStyleCard from '@/components/custom-UI/HoverStyleCard/WhiteHoverStyleCard';

export default function HowItWorks() {
    const steps = [
        {
            title: 'AI Based Register an account to start',
            description: 'Job seekers start by creating an account on the job portal.',
            Icon: Profile
        },
        {
            title: 'Explore over thousands of jobs',
            description: 'Utilize our powerful search engine to find jobs that align with your career goals.',
            Icon: Search
        },
        {
            title: 'Build your professional network',
            description: 'Expand your professional network by connecting with industry peers.',
            Icon: Topology
        },
        {
            title: 'Instant AI Interview & Assesment',
            description: 'After shortlisting, we do AI video interview & tests to provide you..',
            Icon: UserGroup
        }
    ];
    return (
        <div className='container-padding mx-auto border border-transparent lg:mt-[9rem] hidden'>
            <section>
                <p className='text-4xl md:text-5xl lg:text-5xl font-medium leading-tight text-[#D9D9D9] text-center'>How it works</p>
                <p className='my-2 text-[#D9D9D9] text-center text-sm'>Unlock simplicity in your job search journey – explore <br /> &apos;How It Works&apos; on our platform.</p>
            </section>
            <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6'>
                {
                    steps.map(({ Icon, title, description }, index) => (
                        <WhiteHoverStyleCard groupClass={'group/card'} key={index} >
                            <div >
                                <div className='bg-[#E8E8E8] group-hover/card:bg-black h-10 w-10 items-center flex justify-center rounded-full mx-auto mb-2'>
                                    <Icon className='w-6 h-6  stroke-black fill-white group-hover/card:stroke-yellow-500' />
                                </div>
                                <div className='flex flex-col mt-2'>
                                    <h3 className='text-lg font-semibold text-black text-center leading-5 mb-2'>{title}</h3>
                                    <p className='text-black text-sm text-center'>{description}</p>
                                </div>
                            </div>
                        </WhiteHoverStyleCard>
                    ))
                }
            </section>
        </div >
    );
};