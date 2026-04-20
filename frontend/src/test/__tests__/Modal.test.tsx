import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../../components/ui/Modal";

describe("Modal", () => {
  it("renders children inside a role=dialog with aria-modal", () => {
    render(<Modal ariaLabel="test"><p>hi</p></Modal>);
    const dlg = screen.getByRole("dialog", { name: "test" });
    expect(dlg).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal ariaLabel="x" onClose={onClose}><button>inner</button></Modal>);
    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when inner content is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal ariaLabel="x" onClose={onClose}><button>inner</button></Modal>);
    await user.click(screen.getByRole("button", { name: "inner" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal ariaLabel="x" onClose={onClose}><p>body</p></Modal>);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
