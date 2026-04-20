import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../components/ui/Button";

describe("Button", () => {
  it("renders children as the label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables itself and shows busyLabel when busy", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button busy busyLabel="Saving…" onClick={onClick}>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent("Saving…");
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects explicit disabled prop", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies w-full when fullWidth", () => {
    render(<Button fullWidth>Go</Button>);
    expect(screen.getByRole("button").className).toMatch(/w-full/);
  });
});
