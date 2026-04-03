/**
 * Custom hook for error handling
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Hook for handling errors with toast notifications
 */
export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown) => {
    let appError: AppError;

    if (err instanceof Error) {
      appError = {
        code: "ERROR",
        message: err.message,
      };
    } else if (typeof err === "object" && err !== null && "message" in err) {
      appError = {
        code: (err as any).code || "ERROR",
        message: (err as any).message || "Une erreur s'est produite",
        details: (err as any).details,
      };
    } else {
      appError = {
        code: "UNKNOWN_ERROR",
        message: "Une erreur inconnue s'est produite",
      };
    }

    setError(appError);
    toast.error(appError.message);
    console.error("[Error]", appError);

    return appError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSuccess = useCallback((message: string) => {
    clearError();
    toast.success(message);
  }, [clearError]);

  return {
    error,
    handleError,
    clearError,
    handleSuccess,
  };
}

/**
 * Hook for handling async operations with loading state
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">(
    immediate ? "pending" : "idle"
  );
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      return response;
    } catch (err) {
      setError(err as E);
      setStatus("error");
      throw err;
    }
  }, [asyncFunction]);

  // Execute on mount if immediate is true
  if (immediate && status === "pending") {
    execute();
  }

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === "pending",
    isError: status === "error",
    isSuccess: status === "success",
  };
}

/**
 * Hook for form error handling
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
  };
}

/**
 * Hook for retry logic
 */
export function useRetry(maxRetries = 3, delay = 1000) {
  const [retries, setRetries] = useState(0);

  const retry = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          setRetries((prev) => prev + 1);
          return retry(fn);
        }
        throw err;
      }
    },
    [retries, maxRetries, delay]
  );

  const reset = useCallback(() => {
    setRetries(0);
  }, []);

  return { retry, retries, reset };
}
