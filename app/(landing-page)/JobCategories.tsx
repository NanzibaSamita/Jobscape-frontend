import { Admin, Business, Engineer, Finance, Healthcare, Logistics, Machine, Tourism, Transportation } from '@/assets/svg';
import { } from 'react';

export default function JobCategories() {
    const categories = [
        {
            title: "Manufacturing & Production",
            subtitle: "36 Openings",
            Icon: Machine
        },
        {
            title: "Administration",
            subtitle: "36 Openings",
            Icon: Admin
        },
        {
            title: "Healthcare",
            subtitle: "36 Openings",
            Icon: Healthcare
        },
        {
            title: "Engineering and Construction",
            subtitle: "36 Openings",
            Icon: Engineer
        },
        {
            title: "Business, & Management",
            subtitle: "36 Openings",
            Icon: Business
        },
        {
            title: "Finance & Accounting",
            subtitle: "36 Openings",
            Icon: Finance
        },
        {
            title: "Hospitality & Tourism",
            subtitle: "36 Openings",
            Icon: Tourism
        },
        {
            title: "Logistics & Distribution",
            subtitle: "36 Openings",
            Icon: Logistics
        },
        {
            title: "Transportation & Logistics",
            subtitle: "36 Openings",
            Icon: Transportation
        },
    ];

    return (
        <div className='container-padding mx-auto border border-transparent lg:mt-[5rem] hidden'>
            <section className='mt-4 lg:mt-0'>
                <p className='text-2xl md:text-5xl lg:text-5xl font-medium leading-tight text-[#D9D9D9] text-center'>Job Category
                </p>
                <p className='my-2 text-[#D9D9D9] text-center text-xs lg:text-sm'>Global talent centers for specialized skills or delivering managed programs <br /> across focused industries.</p>
            </section>

            <section className='grid grid-cols-1 lg:grid-cols-3 gap-4 mt-16'>
                {
                    categories.map(({ title, subtitle, Icon }, index) => {
                        if (!title || !subtitle || !Icon) return null;
                        return (
                            <div className='border border-slate-500/40 rounded-md w-full flex justify-start items-center gap-4 p-4' key={index}>
                                <div className='h-8 w-8'>
                                    <Icon className='h-full w-full' />
                                </div>
                                <div>
                                    <p className='text-slate-200 text-base font-medium'>{title}</p>
                                    <p className='text-slate-300 text-xs'>{subtitle}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </section>
        </div >
    );
};