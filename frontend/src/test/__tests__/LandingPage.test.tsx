import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../lib/auth";
import LandingPage from "../../pages/LandingPage";

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("LandingPage", () => {
  it("renders the app name", () => {
    renderPage();
    expect(screen.getByText("Holding of Bags")).toBeInTheDocument();
  });

  it("nav Sign In links to /login", () => {
    renderPage();
    const links = screen.getAllByRole("link", { name: /sign in/i });
    expect(links[0]).toHaveAttribute("href", "/login");
  });

  it("nav Get Started Free links to /register", () => {
    renderPage();
    const links = screen.getAllByRole("link", { name: /get started free/i });
    expect(links[0]).toHaveAttribute("href", "/register");
  });

  it("renders the hero h1", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/your party's loot/i);
  });

  it("hero CTA links to /register", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /create your group/i })).toHaveAttribute("href", "/register");
  });

  it("renders the features section heading", () => {
    renderPage();
    expect(screen.getByText(/everything your party needs/i)).toBeInTheDocument();
  });

  it("renders all four feature cards", () => {
    renderPage();
    expect(screen.getByText(/cloud-based/i)).toBeInTheDocument();
    expect(screen.getByText(/up and running in minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/shared hoard/i)).toBeInTheDocument();
    expect(screen.getByText(/everything at a glance/i)).toBeInTheDocument();
  });

  it("renders the testimonials section heading", () => {
    renderPage();
    expect(screen.getByText(/loved by parties everywhere/i)).toBeInTheDocument();
  });

  it("renders three testimonial authors", () => {
    renderPage();
    expect(screen.getByText("Marieke V.")).toBeInTheDocument();
    expect(screen.getByText("Tomás R.")).toBeInTheDocument();
    expect(screen.getByText("Priya S.")).toBeInTheDocument();
  });

  it("renders the pricing section heading", () => {
    renderPage();
    expect(screen.getByText(/simple pricing/i)).toBeInTheDocument();
  });

  it("renders both pricing tiers", () => {
    renderPage();
    expect(screen.getByText("€0")).toBeInTheDocument();
    expect(screen.getByText("€5")).toBeInTheDocument();
  });

  it("pricing CTAs link to /register", () => {
    renderPage();
    const getStartedLinks = screen.getAllByRole("link", { name: /get started free/i });
    expect(getStartedLinks[getStartedLinks.length - 1]).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /upgrade to proficient/i })).toHaveAttribute("href", "/register");
  });

  it("footer Sign In links to /login", () => {
    renderPage();
    const links = screen.getAllByRole("link", { name: /sign in/i });
    expect(links[links.length - 1]).toHaveAttribute("href", "/login");
  });
});
