import { LoginForm } from "../features/auth/components/LoginForm";
import { useLogin } from "../features/auth/hooks/useLogin";

export const LoginPage = () => {
  const { handleLogin, isLoading, error } = useLogin();

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
    </section>
  );
};
