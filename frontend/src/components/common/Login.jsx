import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import loginImage from "../../assets/login1.jpg";
export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
            style={{
                backgroundImage: "url('/src/assets/background image.jpg')",
            }}
        >
            {/* Background */}
            <div className="absolute inset-0">
                <div
                    className="
                        absolute
                        -bottom-40
                        -right-32
                        h-[500px]
                        w-[500px]
                        rounded-full
                        bg-[#789381]/30
                        blur-3xl
                    "
                />
            </div>

            {/* MAIN CARD */}
           <div
    className="
        absolute
        left-1/2
        top-1/2
        h-[680px]
        w-[1100px]
        -translate-x-1/2
        -translate-y-1/2
        overflow-hidden
        rounded-[38px]
        bg-white
    "
    style={{
    boxShadow:
        "0 20px 40px rgba(0, 0, 0, 0.25), 0 40px 100px rgba(30, 50, 40, 0.35)",
}}
>
                {/* IMAGE */}
                <div className="absolute left-0 top-0 z-0 h-full w-[60%]">
                    <img
                        src={loginImage}
                        alt="Decorative background"
                        className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-[#19352b]/30" />
                </div>

                {/* LOGIN SECTION */}
                <div
                    className="
                        absolute
                        right-0
                        top-0
                        z-10
                        h-full
                        w-[40%]
                        bg-white
                        px-[40px]
                        pt-[120px]
                    "
                >
                    <div className="w-[360px]">

                        {/* TITLE */}
                        <h1 className="text-[30px] font-semibold tracking-tight text-[#17241d]">
                            Log in
                        </h1>

                        {/* LOGIN ID */}
                        <div className="mt-9">
                            <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                Login email or Login ID
                            </label>

                            <input
                                type="text"
                                className="
                                    h-[43px]
                                    w-full
                                    rounded-full
                                    border
                                    border-[#aeb5b0]
                                    bg-white
                                    px-5
                                    text-sm
                                    outline-none
                                    shadow-[0_3px_10px_rgba(25,53,43,0.08)]
                                    transition
                                    focus:border-[#405b4d]
                                    focus:ring-2
                                    focus:ring-[#405b4d]/20
                                "
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="mt-5">
                            <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="
                                        h-[43px]
                                        w-full
                                        rounded-full
                                        border
                                        border-[#aeb5b0]
                                        bg-white
                                        px-5
                                        pr-12
                                        text-sm
                                        outline-none
                                        shadow-[0_3px_10px_rgba(25,53,43,0.08)]
                                        transition
                                        focus:border-[#405b4d]
                                        focus:ring-2
                                        focus:ring-[#405b4d]/20
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="
                                        absolute
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-[#8b948e]
                                        hover:text-[#405b4d]
                                    "
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            onClick={() => navigate("/layout")}
                            className="
                                mt-6
                                h-[43px]
                                w-full
                                rounded-full
                                bg-[#405b4d]
                                text-[13px]
                                font-medium
                                text-white
                                shadow-[0_7px_18px_rgba(64,91,77,0.28)]
                                transition-all
                                hover:-translate-y-[1px]
                                hover:bg-[#314b3e]
                                hover:shadow-[0_10px_25px_rgba(64,91,77,0.35)]
                            "
                        >
                            Log in
                        </button>

                        {/* DIVIDER */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-[#9da49f]" />

                            <span className="text-[10px] text-[#777f7a]">
                                Or
                            </span>

                            <div className="h-px flex-1 bg-[#9da49f]" />
                        </div>

                        {/* ADMIN LOGIN */}
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => navigate("/admin-login")}
                                className="
                                    h-[42px]
                                    w-full
                                    rounded-xl
                                    border
                                    border-[#d1d5d2]
                                    bg-white
                                    text-[12px]
                                    font-medium
                                    text-[#405b4d]
                                    shadow-[0_4px_12px_rgba(25,53,43,0.08)]
                                    transition-all
                                    hover:-translate-y-[1px]
                                    hover:border-[#405b4d]
                                    hover:bg-[#f3f6f4]
                                    hover:shadow-[0_7px_18px_rgba(64,91,77,0.15)]
                                "
                            >
                                Login as Admin
                            </button>
                        </div>

                        {/* SIGN UP */}
                        <div className="mt-5 text-center">
                            <p className="text-[11px] text-[#777f7a]">
                                Don't have an account?{" "}

                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="
                                        font-semibold
                                        text-[#405b4d]
                                        hover:text-[#314b3e]
                                        hover:underline
                                    "
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* WAVE */}
                    <svg
                        className="
                            absolute
                            right-[calc(100%-2px)]
                            top-0
                            z-20
                            h-full
                            w-[155px]
                        "
                        viewBox="0 0 155 680"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="
                                M0 0
                                C115 55 125 105 55 170
                                C5 220 15 275 82 335
                                C140 385 120 440 55 500
                                C5 550 20 615 105 680
                                L155 680
                                L155 0
                                Z
                            "
                            fill="white"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}