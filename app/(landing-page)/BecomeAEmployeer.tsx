import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton'
import Link from 'next/link';
import React from 'react'

export default function BecomeAEmployer() {

    return (
        <div className='container-padding mx-auto lg:mt-[5rem] hidden'>
            <section>
                <p className='text-2xl md:text-5xl lg:text-5xl font-medium  text-[#D9D9D9] text-center'>Want to Become a Success
                    <br />
                    Employers?</p>
                <p className='mt-1 text-[#D9D9D9] text-center text-sm'>We&apos;ll help you to grow your career and growth.</p>
            </section>
            <section>
                <div className='max-w-min  mt-4 mx-auto'>
                    <Link href="/signup">
                        <WhiteStyleButton
                            title="Get Started for Free"
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
                    </Link>
                </div>
            </section>
        </div >
    )
}
