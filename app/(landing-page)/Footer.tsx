import { Facebook, Instagram, Linkedin, LocationEdit, Mail, Phone, Twitter, Youtube } from 'lucide-react'
import React from 'react'

export default function Footer() {
    const links = [
        {
            "section": "Company",
            "links": [{ name: "Home", link: "/" }, { name: "Jobs", link: "/" }, { name: "Pricing", link: "/" }, { name: "Contact", link: "/" }, { name: "Career", link: "/" }]
        },
        {
            "section": "Quick Link",
            "links": [
                { name: "Post job for free", link: "/" },
                { name: "Applicant tracking system", link: "/" },
                { name: "Best free job board", link: "/" },
                { name: "How to source candidates", link: "/" },
                { name: "How to post job on wanted.ai", link: "/" },
            ]
        },
        {
            "section": "Product",
            "links": [
                { name: "Job ad builder", link: "/" },
                { name: "Multiposting", link: "/" },
                { name: "Sourcing extension", link: "/" },
                { name: "Applicant screening", link: "/" },
                { name: "Assessments", link: "/" },
            ]
        }
    ]

    return (
        <div className='container-padding mx-auto lg:pt-[5rem] hidden'>
            <section className='grid lg:grid-cols-3 gap-4 '>
                <div className="lg:mt-0 mt-3">
                    <p className='text-2xl text-yellow-400'>WANTED.AI</p>
                    <div>
                        <section className='flex items-center justify-start gap-2 my-1'>
                            <LocationEdit className='w-4 h-4 text-gray-400 inline-block' />
                            <p className='text-gray-400 text-sm'>99 10th Drive Sunnyside, NY 11104</p>
                        </section>
                        <section className='flex items-center justify-start gap-2 my-1'>
                            <Mail className='w-4 h-4 text-gray-400 inline-block' />
                            <p className='text-gray-400 text-sm'>email@wanted.ai.com</p>
                        </section>
                        <section className='flex items-center justify-start gap-2 my-1'>
                            <Phone className='w-4 h-4 text-gray-400 inline-block' />
                            <p className='text-gray-400 text-sm'>315-793-8183</p>
                        </section>
                    </div>
                    <div className='mt-4 flex justify-start items-center gap-2'>
                        <Facebook className='text-black fill-white w-4 h-4' />
                        <Instagram className='text-black fill-white w-4 h-4' />
                        <Twitter className='text-black fill-white w-4 h-4' />
                        <Youtube className='text-black fill-white w-4 h-4' />
                        <Linkedin className='text-black fill-white w-4 h-4' />
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {
                        links.map(({ section, links }, index) => (
                            <div key={index} className='flex flex-col gap-2'>
                                <p className='text-sm font-semibold text-yellow-400'>{section}</p>
                                <ul className='text-[#D9D9D9] text-xs'>
                                    {
                                        links.map((link, idx) => (
                                            <li key={idx} className='my-1'>
                                                <a href={link.link} className='hover:text-yellow-400 transition-colors duration-300'>{link.name}</a>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ))
                    }
                </div>

            </section>

            <section className='mt-4'>
                <p className='text-slate-500 text-center'>© {new Date().getFullYear()} - Wanted.Ai. All rights reserved.</p>
            </section>
        </div>
    )
}
