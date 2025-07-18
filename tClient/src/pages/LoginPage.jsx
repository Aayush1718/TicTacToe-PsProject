import { useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function LoginPage() {
  const { setUser } = useUserContext();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match");
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? `${import.meta.env.VITE_API_URL}/api/login` : `${import.meta.env.VITE_API_URL}/api/register`;
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            userName: formData.userName,
            email: formData.email,
            password: formData.password
          };

      const res = await axios.post(endpoint, payload);

      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      setMessage("Success! Redirecting...");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.message) {
        setMessage(`${err.response.data.message}`);
      } else {
        setMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              name="userName"
              placeholder="Name"
              onChange={handleChange}
              value={formData.userName}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              value={formData.confirmPassword}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>

          {message && (
            <p className="text-center mt-2 text-red-500 font-medium">{message}</p>
          )}
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-medium hover:underline"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
