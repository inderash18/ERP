import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import loginImage from "../../assets/login1.jpg";

export default function Signup() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#e8eee9]">

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
        shadow-[0_25px_70px_rgba(30,50,40,0.18)]
      ">

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

                {/* =========================
            SIGNUP SECTION
        ========================= */}

                <div className="
          absolute
          right-0
          top-0
          z-10
          h-full
          w-[40%]
          bg-white
          px-[40px]
          pt-[80px]
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


                        {/* FULL NAME */}
                        <div className="mt-8">
                            <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                Enter Login Id
                            </label>
                            <input
                                type="text"
                                className="
                  h-[43px] w-full rounded-full border border-[#aeb5b0] bg-white px-5 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                "
                            />
                        </div>

                        {/* EMAIL */}
                        <div className="mt-4">
                            <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="
                  h-[43px] w-full rounded-full border border-[#aeb5b0] bg-white px-5 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                "
                            />
                        </div>


                        {/* PASSWORD */}
                        <div className="mt-4">
                            <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="
                    h-[43px] w-full rounded-full border border-[#aeb5b0] bg-white px-5 pr-12 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                  "
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b948e]"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="mt-4">
                            <label className="mb-2 block text-[12px] font-medium text-[#3f4943]">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="
                    h-[43px] w-full rounded-full border border-[#aeb5b0] bg-white px-5 pr-12 text-sm outline-none transition focus:border-[#405b4d] focus:ring-2 focus:ring-[#405b4d]/20
                  "
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b948e]"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>


                        {/* SIGNUP BUTTON */}
                        <button
                            onClick={() => navigate("/layout")}
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
    hover:bg-[#8B4513]
  "
                        >
                            Sign up
                        </button>


                        {/* LOGIN REDIRECT */}
                        <div className="mt-6 text-center">
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

                        {/* =========================
            WAVY WHITE DIVIDER
        ========================= */}
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
