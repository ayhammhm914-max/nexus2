import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { CartPage } from "./pages/CartPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductsPage } from "./pages/ProductsPage";
import { RegisterPage } from "./pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "store",
        element: <ProductsPage />
      },
      {
        path: "products/:slug",
        element: <ProductDetailPage />
      },
      {
        path: "cart",
        element: <CartPage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
]);
