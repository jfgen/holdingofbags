import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormCard } from "../../components/ui/FormCard";

describe("FormCard", () => {
  it("renders title and children", () => {
    render(
      <FormCard title="Hello" onSubmit={() => {}}>
        <input aria-label="Name" />
      </FormCard>,
    );
    expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("calls onSubmit when the form is submitted via button", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <FormCard title="X" onSubmit={onSubmit}>
        <button type="submit">Go</button>
      </FormCard>,
    );
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders optional subtitle when provided", () => {
    render(
      <FormCard title="T" subtitle="sub" onSubmit={() => {}}>
        <span />
      </FormCard>,
    );
    expect(screen.getByText("sub")).toBeInTheDocument();
  });
});
