import { render, screen } from "@testing-library/react";
import { ErrorText } from "../../components/ui/ErrorText";

describe("ErrorText", () => {
  it("renders the message when provided", () => {
    render(<ErrorText>something broke</ErrorText>);
    expect(screen.getByText("something broke")).toBeInTheDocument();
  });

  it("renders nothing when children is null", () => {
    const { container } = render(<ErrorText>{null}</ErrorText>);
    expect(container.firstChild).toBeNull();
  });
});
