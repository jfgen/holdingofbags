import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemForm } from "../../components/ItemForm";

const defaults = { name: "Potion", description: "Heals hp", amount: "3", value: "5.00" };

describe("ItemForm", () => {
  it("renders all four fields", () => {
    render(<ItemForm title="Test" onSubmit={() => {}} onCancel={() => {}} submitLabel="Save" />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
  });

  it("pre-populates fields from initialValues", () => {
    render(<ItemForm title="Test" initialValues={defaults} onSubmit={() => {}} onCancel={() => {}} submitLabel="Save" />);
    expect(screen.getByLabelText(/^name$/i)).toHaveValue("Potion");
    expect(screen.getByLabelText(/amount/i)).toHaveValue(3);
  });

  it("calls onSubmit with form values on valid submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm title="Test" initialValues={defaults} onSubmit={onSubmit} onCancel={() => {}} submitLabel="Save" />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledWith(defaults);
  });

  it("allows amount of 0", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm title="Test" initialValues={{ ...defaults, amount: "0" }} onSubmit={onSubmit} onCancel={() => {}} submitLabel="Save" />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledWith({ ...defaults, amount: "0" });
  });

  it("shows error and does not call onSubmit when amount is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm title="Test" initialValues={{ ...defaults, amount: "" }} onSubmit={onSubmit} onCancel={() => {}} submitLabel="Save" />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/whole number/i)).toBeInTheDocument();
  });

  it("shows error and does not call onSubmit when amount is negative", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm title="Test" initialValues={{ ...defaults, amount: "-1" }} onSubmit={onSubmit} onCancel={() => {}} submitLabel="Save" />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/whole number/i)).toBeInTheDocument();
  });

  it("shows error and does not call onSubmit when amount is a decimal", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm title="Test" initialValues={{ ...defaults, amount: "1.5" }} onSubmit={onSubmit} onCancel={() => {}} submitLabel="Save" />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/whole number/i)).toBeInTheDocument();
  });

  it("calls onCancel when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ItemForm title="Test" onSubmit={() => {}} onCancel={onCancel} submitLabel="Save" />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
