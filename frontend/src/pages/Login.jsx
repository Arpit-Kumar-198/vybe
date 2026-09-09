import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Logo from "../components/Logo";

const Login = () => {
  const [input, setInput] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;

    setInput((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    const emailOrUsername = input.emailOrUsername.trim();
    const password = input.password;

    if (!emailOrUsername || !password) {
      toast.error("Please enter your email/username and password.");
      return;
    }

    try {
      setLoading(true);

      const isEmail = emailOrUsername.includes("@");

      const loginData = {
        ...(isEmail
          ? { email: emailOrUsername }
          : { username: emailOrUsername }),
        password,
      };

      const res = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        loginData,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        setInput({
          emailOrUsername: "",
          password: "",
        });

        toast.success(res.data.message);

        navigate("/");
      }
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-8">
      <form
        onSubmit={loginHandler}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8"
      >
        {/* Header */}
        <div className="mb-6 space-y-2">
          <h1 className="flex justify-center align-middle text-center text-2xl font-bold">
            <Logo />
          </h1>

          <p className="text-center text-sm text-gray-600">
            Login to see photos & videos from your friends
          </p>
        </div>

        {/* Email / Username */}
        <div className="mb-4">
          <label htmlFor="emailOrUsername" className="text-sm font-medium">
            Email or Username
          </label>

          <Input
            id="emailOrUsername"
            type="text"
            name="emailOrUsername"
            value={input.emailOrUsername}
            onChange={changeEventHandler}
            placeholder="Email or username"
            autoComplete="username"
            disabled={loading}
            className="mt-2 focus-visible:ring-0"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>

          <Input
            id="password"
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Password"
            autoComplete="current-password"
            disabled={loading}
            className="mt-2 focus-visible:ring-0"
          />
        </div>

        {/* Login button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : (
            "Login"
          )}
        </Button>

        {/* Signup */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
