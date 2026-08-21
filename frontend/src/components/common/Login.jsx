import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import loginImage from "../../assets/login1.jpg";
import backgroundImage from "../../assets/background image.jpg";
import { useErp } from "../../context/ErpContext";

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useErp();

    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Validation & API Error States
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        const trimmedEmployeeId = employeeId.trim();

        if (!trimmedEmployeeId) {
            newErrors.employeeId = "Employee ID / Login ID is required";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setApiError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await loginUser(employeeId, password, false);
            navigate("/layout");
        } catch (err) {
            setApiError(err.message || "Invalid Employee ID or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
            style={{
                backgroundImage: `url("${backgroundImage}")`,
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
                        pt-[100px]
                    "
                >
                    <div className="w-[360px]">

                        {/* TITLE */}
                        <h1 className="text-[30px] font-semibold tracking-tight text-[#17241d]">
                            Log in
                        </h1>

                        {/* API Error Alert */}
                        {apiError && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                                <AlertCircle size={15} className="flex-shrink-0" />
                                <span>{apiError}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} noValidate>
                            {/* LOGIN ID / EMAIL */}
                            <div className="mt-6">
                                <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                    Employee ID / Login ID
                                </label>

                                <input
                                    type="text"
                                    autoComplete="username"
                                    value={employeeId}
                                    onChange={(e) => {
                                        setEmployeeId(e.target.value);
                                        if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: "" }));
                                    }}
                                    placeholder="SALE04"
                                    className={`
                                        h-[43px]
                                        w-full
                                        rounded-full
                                        border
                                        ${errors.employeeId ? "border-red-500 ring-1 ring-red-500/30" : "border-[#aeb5b0]"}
                                        bg-white
                                        px-5
                                        text-sm
                                        outline-none
                                        shadow-[0_3px_10px_rgba(25,53,43,0.08)]
                                        transition
                                        focus:border-[#405b4d]
                                        focus:ring-2
                                        focus:ring-[#405b4d]/20
                                    `}
                                />
                                {errors.employeeId && (
                                    <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                                        {errors.employeeId}
                                    </p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div className="mt-4">
                                <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                        }}
                                        placeholder="••••••••"
                                        className={`
                                            h-[43px]
                                            w-full
                                            rounded-full
                                            border
                                            ${errors.password ? "border-red-500 ring-1 ring-red-500/30" : "border-[#aeb5b0]"}
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
                                        `}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
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
                                {errors.password && (
                                    <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    mt-6
                                    h-[43px]
                                    w-full
                                    rounded-full
                                    bg-[#8B4513]
                                    text-[13px]
                                    font-medium
                                    text-white
                                    shadow-[0_7px_18px_rgba(64,91,77,0.28)]
                                    transition-all
                                    hover:-translate-y-[1px]
                                    hover:bg-[#72380f]
                                    hover:shadow-[0_10px_25px_rgba(64,91,77,0.35)]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    "Log in"
                                )}
                            </button>
                        </form>

                        {/* DIVIDER */}
                        <div className="my-5 flex items-center gap-4">
                            <div className="h-px flex-1 bg-[#9da49f]" />
                            <span className="text-[10px] text-[#777f7a]">
                                Or
                            </span>
                            <div className="h-px flex-1 bg-[#9da49f]" />
                        </div>

                        {/* ADMIN LOGIN */}
                        <div>
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