export default function TableSkeleton() {
    return (
        <div className="mx-auto overflow-y-clip">
            <div className="animate-pulse flex">
                <div className="flex-1 overflow-y-clip space-y-3 py-1">
                    {Array(15)
                        .fill(null)
                        .map((item, index) => {
                            return (
                                <div key={index} className="h-[40px] bg-gray-200 rounded"></div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
