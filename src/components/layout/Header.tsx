import { useApp } from "@/context/AppContext";
import HeaderPublic from "./HeaderPublic";
import HeaderAuth from "./HeaderAuth";

/**
 * Smart Header: renders the authenticated or public variant
 * based on the current auth state from context.
 */
export default function Header() {
  const {
    isLoggedIn,
    userEmail,
    cartItemCount,
    setCurrentPage,
    previousPage,
    navigateTo,
    handleLogout,
  } = useApp();

  const nav = {
    onHomeClick: () => setCurrentPage("landing"),
    onPortfolioClick: () => setCurrentPage("portfolio"),
    onAboutClick: () => setCurrentPage("aboutUs"),
  };

  if (isLoggedIn) {
    return (
      <HeaderAuth
        {...nav}
        userEmail={userEmail}
        cartItemCount={cartItemCount}
        onCartClick={() => navigateTo("cart", true)}
        onProfileClick={() => navigateTo("profile", true)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <HeaderPublic
      {...nav}
      onLoginClick={() => setCurrentPage("login")}
    />
  );
}
