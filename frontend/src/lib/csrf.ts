const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

let csrfToken: string | null = null;

export const getCsrfToken = () => csrfToken;

export const ensureCsrfToken = async (force = false) => {
  if (csrfToken && !force) {
    return csrfToken;
  }

  const response = await fetch(`${apiBaseUrl}/csrf`, {
    credentials: "include",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to initialize CSRF protection.");
  }

  const payload = (await response.json()) as {
    data?: {
      csrfToken?: string;
    };
  };

  csrfToken =
    payload.data?.csrfToken ??
    response.headers.get("x-csrf-token") ??
    null;

  return csrfToken;
};

export const getCsrfHeaders = () =>
  csrfToken
    ? {
        "X-CSRF-Token": csrfToken
      }
    : undefined;
