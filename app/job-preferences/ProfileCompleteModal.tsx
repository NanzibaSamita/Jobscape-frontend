import { Card, CardContent } from '@/components/ui/card'
import ProgressCard from '@/components/ui/ProgressCard'
import React from 'react'

export default function ProfileCompleteModal({ actions }: { actions?: Array<{ label: string, onClick?: () => void }> }) {
    return (
        <Card className="w-full max-w-md mx-auto shadow-lg min-w-96">
            <CardContent className="p-8 text-center">
                <div className='w-32 h-32 mx-auto'><ProgressCard percentage={60}><span className="text-3xl font-bold">{60}%</span></ProgressCard></div>
                <p className='text-2xl font-semibold text-muted-foreground'>Profile All most Completed</p>
                <div className='flex items-center justify-around mt-4'>
                    {
                        actions?.map(({ label, onClick }, idx) => (
                            <button
                                key={label + idx}
                                className="px-4 py-2 bg-slate-400/30 text-muted-foreground rounded-full"
                                onClick={onClick}
                                type="button"
                            >
                                {label}
                            </button>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    )
}
