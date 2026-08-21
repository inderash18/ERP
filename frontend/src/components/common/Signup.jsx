import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import loginImage from "../../assets/login1.jpg";
import backgroundImage from "../../assets/background image.jpg";
import { useErp } from "../../context/ErpContext";

export default function Signup() {
    const navigate = useNavigate();
    const { signupUser } = useErp();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation & Status States
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            newErrors.name = "Full name / Login ID is required";
        }

        if (!trimmedEmail) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        if (e) e.preventDefault();
        setApiError("");
        setSuccessMsg("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await signupUser({ name, email, password });
            setSuccessMsg("Account registered successfully! Redirecting...");
            setTimeout(() => {
                navigate("/layout");
            }, 1200);
        } catch (err) {
            setApiError(err.message || "Registration failed. Please try again.");
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
                <div className="
          absolute
          -bottom-40
          -right-32
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#789381]/30
          blur-3xl
        " />
            </div>

            {/* MAIN CARD */}
            <div className="
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
                    {/* GREEN OVERLAY */}
                    <div className="absolute inset-0 bg-[#19352b]/30" />
                </div>

                {/* SIGNUP SECTION */}
                <div className="
          absolute
          right-0
          top-0
          z-10
          h-full
          w-[40%]
          bg-white
          px-[40px]
          pt-[65px]
        ">

                    <div className="w-[360px]">

                        {/* TITLE */}
                        <h1 className="
              text-[30px]
              font-semibold
              tracking-tight
              text-[#17241d]
            ">
                            Sign up
                        </h1>

                        {/* API Alerts */}
                        {apiError && (
                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                                <AlertCircle size={15} className="flex-shrink-0" />
                                <span>{apiError}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 size={15} className="flex-shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSignup} noValidate>
                            {/* FULL NAME */}
                            <div className="mt-5">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#3f4943]">
                                    Full Name or Login ID
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                                    }}
                                    placeholder="e.g. Alexander Reed"
                                    className={`
                                        h-[40px] w-full rounded-full border
                                        ${errors.name ? "border-red-500 ring-1 ring-red-500/30" : "border-[#aeb5b0]"}
                                        bg-white px-5 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                                    `}
                                />
                                {errors.name && (
                                    <p className="mt-1 ml-3 text-[11px] font-medium text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div className="mt-3">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#3f4943]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                    }}
                                    placeholder="alex@company.com"
                                    className={`
                                        h-[40px] w-full rounded-full border
                                        ${errors.email ? "border-red-500 ring-1 ring-red-500/30" : "border-[#aeb5b0]"}
                                        bg-white px-5 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                                    `}
                                />
                                {errors.email && (
                                    <p className="mt-1 ml-3 text-[11px] font-medium text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div className="mt-3">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#3f4943]">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                        }}
                                        placeholder="Min. 6 characters"
                                        className={`
                                            h-[40px] w-full rounded-full border
                                            ${errors.password ? "border-red-500 ring-1 ring-red-500/30" : "border-[#aeb5b0]"}
                                            bg-white px-5 pr-12 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b948e]"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 ml-3 text-[11px] font-medium text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="mt-3">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#3f4943]">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                                        }}
                                        placeholder="Repeat password"
                                        className={`
                                            h-[40px] w-full rounded-full border
                                            ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-500/30" : "border-[#aeb5b0]"}
                                            bg-white px-5 pr-12 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b948e]"
                                    >
                                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 ml-3 text-[11px] font-medium text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* SIGNUP BUTTON */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="
                                    mt-5
                                    h-[42px]
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
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    "Sign up"
                                )}
                            </button>
                        </form>

                        {/* LOGIN REDIRECT */}
                        <div className="mt-4 text-center">
                            <p className="text-[12px] text-[#777f7a]">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="
                                        font-semibold
                                        text-[#405b4d]
                                        hover:text-[#8B4513]
                                        hover:underline
                                    "
                                >
                                    Log in
                                </button>
                            </p>
                        </div>

                        {/* WAVY WHITE DIVIDER */}
                        <svg
                            className="absolute right-[calc(100%-2px)] top-0 z-20 h-full w-[155px]"
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
        </div>
    );
}
