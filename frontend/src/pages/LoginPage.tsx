import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // 1. Authenticate and get token
      const res = await apiClient.post("/auth/login", data);
      const token = res.data.access_token;
      
      // 2. Temporarily set token in store so the next request uses it
      useAuthStore.getState().login(token, null);
      
      // 3. Fetch user profile
      const userRes = await apiClient.get("/auth/me");
      const userData = {
        email: userRes.data.email,
        role: userRes.data.role,
        fullName: userRes.data.full_name,
      };
      
      // 4. Update store with full user data
      useAuthStore.getState().login(token, userData);
      
      // 5. Navigate to dashboard
      navigate("/", { replace: true });
    } catch (err: any) {
      // Clear token if it failed midway
      useAuthStore.getState().logout();
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.response?.data?.detail || "An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Project Tracker</h1>
          <p className={styles.subtitle}>Log in to access your dashboard</p>
        </div>

        {error && <div className={styles.globalError}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="admin@projecttracker.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message as string}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password.message as string}</span>}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
