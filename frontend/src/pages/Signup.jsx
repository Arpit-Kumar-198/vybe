import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Logo from "../components/Logo";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/authSlice";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
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

  const signupHandler = async (e) => {
    e.preventDefault();

    const username = input.username.trim();
    const email = input.email.trim();
    const password = input.password;

    if (!username || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        {
          username,
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        setInput({
          username: "",
          email: "",
          password: "",
        });

        toast.success(res.data.message);

        navigate("/");
      }
    } catch (error) {
      console.error(
        "Signup error:",
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
        onSubmit={signupHandler}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8"
      >
        {/* Header */}
        <div className="mb-6 space-y-2">
          <h1 className="flex justify-center align-middle text-center text-2xl font-bold">
            <Logo />
          </h1>

          <p className="text-center text-sm text-gray-600">
            Sign up to see photos & videos from your friends
          </p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>

          <Input
            id="username"
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            placeholder="Enter username"
            autoComplete="username"
            disabled={loading}
            className="mt-2 focus-visible:ring-0"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>

          <Input
            id="email"
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter email"
            autoComplete="email"
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
            placeholder="Enter password"
            autoComplete="new-password"
            disabled={loading}
            className="mt-2 focus-visible:ring-0"
          />
        </div>

        {/* Signup button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : (
            "Sign up"
          )}
        </Button>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
