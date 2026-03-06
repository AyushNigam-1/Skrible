import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Feather, Loader2, Mail, Lock, User } from "lucide-react";
import { REGISTER_MUTATION } from "../../graphql/mutation/userMutations";

const CreateAccount = () => {
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [register, { loading }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await register({
        variables: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      });
      const user = response.data.register;
      localStorage.setItem(
        "user",
        JSON.stringify({ id: user.id, username: user.username }),
      );
      toast.success("Account created successfully!");
      nav("/");
    } catch (err) {
      toast.error(err.message);
      console.error("Register failed:", err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Premium Input Styling (Matches Login component)
  const inputWrapperClass = "relative flex items-center w-full group";
  const iconClass =
    "absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors";
  const inputClass =
    "w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all outline-none placeholder:text-transparent peer shadow-sm dark:shadow-inner font-['Inter']";
  const floatingLabelClass =
    "absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:bg-white dark:peer-focus:bg-[#11131A] peer-focus:px-2 peer-focus:rounded-full peer-valid:-top-2 peer-valid:left-4 peer-valid:text-xs peer-valid:bg-white dark:peer-valid:bg-[#11131A] peer-valid:px-2 peer-valid:rounded-full pointer-events-none";

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-8 p-6 sm:p-10 bg-white dark:bg-[#11131A]/80 dark:backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Subtle background glow for dark mode */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none hidden dark:block" />

      {/* --- Header --- */}
      <div className="flex flex-col items-center text-center gap-3 relative z-10">
        <div className="bg-amber-50 dark:bg-white/5 border border-amber-100 dark:border-white/10 rounded-full p-4 shadow-sm mb-2">
          <Feather
            className="w-8 h-8 text-amber-600 dark:text-amber-100/80"
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-['Playfair_Display'] tracking-tight">
          Join Skribe
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-['Literata'] text-sm sm:text-base">
          Start your journey and collaborate with writers worldwide.
        </p>
      </div>

      {/* --- Social Login --- */}
      <div className="flex flex-col gap-4 relative z-10">
        <button className="w-full flex justify-center items-center gap-3 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-300 py-3.5 shadow-sm active:scale-[0.98]">
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>
      </div>

      {/* --- Divider --- */}
      <div className="flex items-center gap-4 relative z-10">
        <hr className="flex-grow border-gray-200 dark:border-white/10" />
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold font-['Inter']">
          OR EMAIL
        </span>
        <hr className="flex-grow border-gray-200 dark:border-white/10" />
      </div>

      {/* --- Registration Form --- */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 relative z-10"
      >
        <div className={inputWrapperClass}>
          <User className={iconClass} />
          <input
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className={inputClass}
          />
          <label htmlFor="username" className={floatingLabelClass}>
            Username
          </label>
        </div>

        <div className={inputWrapperClass}>
          <Mail className={iconClass} />
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
          <label htmlFor="email" className={floatingLabelClass}>
            Email Address
          </label>
        </div>

        <div className={inputWrapperClass}>
          <Lock className={iconClass} />
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={inputClass}
          />
          <label htmlFor="password" className={floatingLabelClass}>
            Password
          </label>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !formData.username ||
            !formData.email ||
            !formData.password
          }
          className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black py-4 rounded-2xl transition-all duration-300 font-bold text-base shadow-lg shadow-gray-900/20 dark:shadow-white/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2 font-['Inter']"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* --- Footer --- */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center font-['Inter'] relative z-10 mt-2">
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline decoration-transparent hover:decoration-current underline-offset-4"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;
