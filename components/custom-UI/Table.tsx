/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import TableSkeleton from "./TableSkeleton";

const Table = ({
    config = [],
    data = [],
    styles = {
        th: "",
        td: "",
    },
    Action = null,
    handleChecked = (s: any) => {
        console.log(s);
    },
    selectSystem = false,
    showSerial = false,
    currentPage = 0,
    inPageItems = 10,
    isLoading = false,
}: {
    config: any[];
    data: any[];
    styles: any;
    Action: any;
    handleChecked: any;
    selectSystem: boolean;
    showSerial: boolean;
    currentPage: number;
    inPageItems: number;
    isLoading: boolean;
}) => {
    const [selected, setSelected] = useState<string[]>([]);
    const handleCheck = (isChecked: boolean, id: string) => {
        if (isChecked) {
            setSelected((prev) => [...prev, id]);
        } else {
            setSelected((prev) => {
                prev = prev.filter((f) => f !== id);
                return [...prev];
            });
        }
    };

    useEffect(() => {
        handleChecked(selected);
    }, [selected]);

    return (
        <>
            {isLoading ? (
                <TableSkeleton />
            ) : (
                <table className="w-full overflow-y-auto">
                    <thead className="text-sm font-semibold sticky top-0 z-20">
                        <tr className="h-[42px] bg-[#F7FBFF] dark:bg-[#212222]">
                            {selectSystem && (
                                <th className={`${styles.th || ""} px-2 w-[20px]`}>
                                    <label className="checkbox-container">
                                        <input
                                            className="custom-checkbox h-[16px] w-[16px] accent-black"
                                            type="checkbox"
                                            checked={selected.length === data.length}
                                            onChange={({ target: { checked } }) =>
                                                checked
                                                    ? setSelected(data.map((d: any) => d.id))
                                                    : setSelected([])
                                            }
                                        />
                                        <span className="checkmark"></span>
                                    </label>
                                </th>
                            )}
                            {showSerial && (
                                <th
                                    className={` ${styles.th || ""
                                        } text-center px-2 max-w-min text-nowrap text-[#4F577A] dark:text-[#f8dc52]`}
                                >
                                    SL
                                </th>
                            )}
                            {config.map(({ title }, index) => (
                                <th
                                    className={`${styles.th || ""
                                        } text-start text-nowrap px-2 text-[#4F577A] dark:text-[#c3ac3a]`}
                                    key={index}
                                >
                                    {title}
                                </th>
                            ))}
                            {Action && (
                                <th
                                    className={` ${styles.th || ""
                                        } text-start w-[10px] px-2 sticky right-0 text-[#4F577A] dark:text-[#f8dc52]`}
                                >
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-[1rem] font-[400] leading-[1.5rem]">
                        {data.length > 0 ? (
                            data.map((d: any, index) => (
                                <tr
                                    key={index}
                                    className=" even:border-white/10 dark:even:bg-[#fffc3e11] even:bg-[#696e8c11] even:border-y hover:bg-slate-50 dark:hover:bg-[#fff06530]"
                                >
                                    {selectSystem && (
                                        <td className={`${styles.td || ""} py-3 px-5`}>
                                            <label className="checkbox-container">
                                                <input
                                                    className="custom-checkbox h-[16px] w-[16px] accent-black"
                                                    type="checkbox"
                                                    checked={
                                                        selected.find((f) => f === d.id) ? true : false
                                                    }
                                                    onChange={({ target: { checked } }) =>
                                                        handleCheck(checked, d.id)
                                                    }
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                        </td>
                                    )}
                                    {showSerial && (
                                        <td
                                            className={`${styles.td || ""
                                                } py-2 px-2 text-sm font-semibold text-[#4F577A] dark:text-muted-foreground text-center max-w-min`}
                                        >
                                            {currentPage * inPageItems + index + 1 - inPageItems}
                                        </td>
                                    )}
                                    {config.map(({ Comp, path }: any, i) =>
                                        Comp ? (
                                            <td key={index + i}>{Comp(d)}</td>
                                        ) : (
                                            <td className="py-2 px-2  " key={index + i}>
                                                {" "}
                                                <p className="line-clamp-3 max-h-[90px] text-sm text-[#4F577A] dark:text-muted-foreground">
                                                    {d[path]}
                                                </p>{" "}
                                            </td>
                                        )
                                    )}
                                    {Action && (
                                        <td className="sticky right-0 z-10">{Action(d)}</td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        config.length +
                                        (selectSystem ? 1 : 0) +
                                        (showSerial ? 1 : 0) +
                                        (Action ? 1 : 0)
                                    }
                                    className="text-center py-4 text-[#4F577A] dark:text-muted-foreground"
                                >
                                    No Data Available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
};
export default Table;
