import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmojiPicker } from "../../components/EmojiPicker";
import { CHARACTER_EMOJIS } from "../../lib/emojis";

describe("EmojiPicker", () => {
  it("renders one button per emoji in the curated set", () => {
    render(<EmojiPicker value={CHARACTER_EMOJIS[0]} onChange={() => {}} />);
    expect(screen.getAllByRole("radio")).toHaveLength(CHARACTER_EMOJIS.length);
  });

  it("marks the selected emoji with aria-checked=true", () => {
    render(<EmojiPicker value="⚔" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "emoji ⚔" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "emoji 🏹" })).not.toBeChecked();
  });

  it("calls onChange with the clicked emoji", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EmojiPicker value="⚔" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "emoji 🏹" }));
    expect(onChange).toHaveBeenCalledWith("🏹");
  });

  it("uses a custom label when provided", () => {
    render(<EmojiPicker value="⚔" onChange={() => {}} label="Pick your fighter" />);
    expect(screen.getByRole("radiogroup", { name: "Pick your fighter" })).toBeInTheDocument();
  });
});
