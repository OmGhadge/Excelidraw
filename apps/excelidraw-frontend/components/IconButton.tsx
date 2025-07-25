import { ReactNode } from "react";

export function IconButton({icon,onClick,activated,disabled}:{
    icon:ReactNode,
    onClick:()=>void,
    activated:boolean,
    disabled?:boolean
}){
    return <div
        className={`m-2 pointer rounded-full border p-2 bg-black hover:bg-gray cursor-pointer ${activated ? "text-white" : "text-gray"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
    >
     {icon}
    </div>
}

