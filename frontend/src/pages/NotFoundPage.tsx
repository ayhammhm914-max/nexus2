import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export const NotFoundPage = () => {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <div className="text-sm uppercase tracking-[0.3em] text-primary">404</div>
      <h1 className="mt-4 font-display text-5xl text-white">Signal lost.</h1>
      <p className="mt-4 max-w-xl text-muted">
        The page you were looking for is outside the current NEXUS grid.
      </p>
      <Link to="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </section>
  );
};

