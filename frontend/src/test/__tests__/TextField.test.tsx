import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "../../components/ui/TextField";

describe("TextField", () => {
  it("renders the label connected to the input", () => {
    render(<TextField label="Email" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("calls onChange with the raw string as user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField label="Name" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText("Name"), "abc");
    expect(onChange).toHaveBeenNthCalledWith(1, "a");
    expect(onChange).toHaveBeenNthCalledWith(2, "b");
    expect(onChange).toHaveBeenNthCalledWith(3, "c");
  });

  it("forwards type to the input element", () => {
    render(<TextField label="Password" type="password" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("forwards arbitrary input attributes like minLength and required", () => {
    render(<TextField label="Name" required minLength={3} value="" onChange={() => {}} />);
    const input = screen.getByLabelText("Name");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("minLength", "3");
  });
});
