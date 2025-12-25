"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function Faq() {
    const [openItem, setOpenItem] = useState<string>("")
    const questions = [
        {
            "question": "Is there a free trial available?",
            "answer": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release."
        },
        {
            "question": "Can I change my plan later?",
            "answer": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release."
        },
        {
            "question": "What is your cancellation policy?",
            "answer": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release."
        },
        {
            "question": "How can I get better job matches?",
            "answer": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release."
        },
        {
            "question": "Can I save job listings for later?",
            "answer": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release."
        }
    ]

    return (
        <div className='container-padding mx-auto lg:mt-[5rem] hidden'>
            <section>
                <p className='text-2xl  md:text-5xl lg:text-5xl font-medium  text-[#D9D9D9] text-center'>Frequently asked questions</p>
                <p className='my-2 text-[#D9D9D9] text-center text-sm'>Everything you need to know about the product and billing.</p>
            </section>
            <Accordion type="single" value={openItem} onValueChange={setOpenItem} className="w-full space-y-4 mt-4">
                {questions.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="shadow-sm border-b border-slate-500/50">
                        <AccordionTrigger className="hover:no-underline py-4 [&>svg]:hidden">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-left font-medium text-slate-300 text-md lg:text-lg">{item.question}</span>
                                {openItem === `item-${index}` ? (
                                    <Plus className="h-5 w-5 shrink-0 transition-transform duration-200 text-yellow-500" />
                                ) : (
                                    <Plus className="h-5 w-5 shrink-0 transition-transform duration-200 text-gray-500" />
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed text-balance text-gray-400">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
