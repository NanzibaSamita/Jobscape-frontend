import ProgressCard from '@/components/ui/ProgressCard';

const ResumeScoreCard = ({
    resumeScore = 60,
    structureScore = 56,
    resultsScore = 30,
}) => {


    return (
        <div className="w-full h-full border rounded-2xl p-4">
            <h2 className="text-base text-center font-semibold mb-3">Resume Score</h2>
            <div className="w-1/3 mx-auto">
                <ProgressCard
                    percentage={resumeScore}
                    runnerColor="black"
                    mid={true}
                >
                    <div className="flex flex-col items-center justify-center mt-3">
                        <p className="text-sm font-semibold leading-3">{resumeScore}%</p>
                        <p className="text-xs font-thin text-muted-foreground leading-3">score</p>
                    </div>
                </ProgressCard>
            </div>
            {/* Score Bars */}
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Resume Structure</span>
                        <span className="text-black">{structureScore}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-gray-200">
                        <div
                            className="absolute h-2 rounded-full bg-primary"
                            style={{ width: `${structureScore}%` }}
                        />
                        <div
                            className="absolute left-[calc(var(--width)-0.5rem)] w-2 h-2 rounded-full bg-white border border-primary"
                            style={{ left: `calc(${structureScore}% - 4px)` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Measurable Results</span>
                        <span className="text-black">{resultsScore}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-gray-200">
                        <div
                            className="absolute h-2 rounded-full bg-black"
                            style={{ width: `${resultsScore}%` }}
                        />
                        <div
                            className="absolute left-[calc(var(--width)-0.5rem)] w-2 h-2 rounded-full bg-white border border-black"
                            style={{ left: `calc(${resultsScore}% - 4px)` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeScoreCard;
