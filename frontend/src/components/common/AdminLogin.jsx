import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import loginImage from "../../assets/wall.jpg";
import backgroundImage from "../../assets/background image.jpg";
import { useErp } from "../../context/ErpContext";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { loginUser } = useErp();

    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Validation & Error States
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        const trimmedEmployeeId = employeeId.trim();

        if (!trimmedEmployeeId) {
            newErrors.employeeId = "Admin Employee ID is required";
        }

        if (!password) {
            newErrors.password = "Admin password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdminLogin = async (e) => {
        if (e) e.preventDefault();
        setApiError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await loginUser(employeeId, password, true);
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
                }}>
                {/* IMAGE PANEL */}
                <div className="absolute left-0 top-0 h-full w-[60%] z-0">
                    <img
                        src={loginImage}
                        alt="Decorative background"
                        className="h-full w-full object-cover"
                    />

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
                        <div className="flex items-center gap-2">
                            <Shield size={24} className="text-[#405b4d]" />
                            <h1
                                className="
                  text-[30px]
                  font-semibold
                  tracking-tight
                  text-[#17241d]
                "
                            >
                                Admin Login
                            </h1>
                        </div>

                        {/* API Error Alert */}
                        {apiError && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                                <AlertCircle size={15} className="flex-shrink-0" />
                                <span>{apiError}</span>
                            </div>
                        )}

                        <form onSubmit={handleAdminLogin} noValidate>
                            {/* EMPLOYEE ID */}
                            <div className="mt-6">
                                <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                    Admin Employee ID
                                </label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    value={employeeId}
                                    onChange={(e) => {
                                        setEmployeeId(e.target.value);
                                        if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: "" }));
                                    }}
                                    placeholder="e.g. ADMIN01"
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
                                <label
                                    className="
                    mb-2
                    block
                    text-[12px]
                    font-medium
                    text-[#3f4943]
                  "
                                >
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
                                className="
                                    mt-6
                                    h-[43px]
                                    w-full
                                    rounded-full
                                    bg-[#8B4513]
                                    text-[13px]
                                    font-medium
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-[#72380f]
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Verifying Admin Access...</span>
                                    </>
                                ) : (
                                    "Log in as Admin"
                                )}
                            </button>
                        </form>

                        {/* DIVIDER */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-[#9da49f]" />
                            <span className="whitespace-nowrap text-[10px] text-[#777f7a]">
                                Or
                            </span>
                            <div className="h-px flex-1 bg-[#9da49f]" />
                        </div>

                        {/* USER LOGIN */}
                        <div className="mt-5 flex justify-center">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="
                  font-semibold
                  text-[#405b4d]
                  hover:text-[#314b3e]
                  hover:underline
                  text-[12px]
                "
                            >
                                Login as User
                            </button>
                        </div>
                    </div>

                    {/* WAVE */}
                    <svg
                        className="
                            absolute
                            -left-[153px]
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
