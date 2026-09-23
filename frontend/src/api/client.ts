import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

interface ZodFlattenedError {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
}

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data?.error as
      | { message?: string; details?: ZodFlattenedError }
      | undefined;

    const details = body?.details;
    if (details) {
      const fieldMessages = Object.values(details.fieldErrors ?? {})
        .flat()
        .filter((m): m is string => Boolean(m));
      const messages = [...(details.formErrors ?? []), ...fieldMessages];
      if (messages.length > 0) return messages.join(" ");
    }

    if (typeof body?.message === "string") return body.message;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
