import { SignUpForm } from "../features/auth/components/SignUpForm";
import { useSignUp } from "../features/auth/hooks/useSignUp";

export const RegisterPage = () => {
  const { handleSignUp, isLoading, error, success } = useSignUp();

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <SignUpForm
        onSubmit={handleSignUp}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </section>
  );
};
