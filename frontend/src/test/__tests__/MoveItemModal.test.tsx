import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoveItemModal } from "../../components/MoveItemModal";
import type { Item, Member } from "../../types";

const item: Item = {
  id: "i1", groupId: "g", memberId: null, name: "Arrows",
  description: "", amount: 20, value: "0", createdAt: "", updatedAt: "",
};
const members: Member[] = [
  { id: "m1", userId: "u1", groupId: "g", characterName: "Legolas", characterEmoji: "🏹", joinedAt: "" },
  { id: "m2", userId: "u2", groupId: "g", characterName: "Gimli",   characterEmoji: "🪓", joinedAt: "" },
];

describe("MoveItemModal", () => {
  it("disables the current location choice (hoard when memberId is null)", () => {
    render(<MoveItemModal item={item} members={members} onClose={() => {}} onMove={() => {}} />);
    expect(screen.getByRole("radio", { name: /hoard/i })).toBeDisabled();
  });

  it("selecting a destination and confirming calls onMove with quantity + memberId", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<MoveItemModal item={item} members={members} onClose={() => {}} onMove={onMove} />);
    await user.click(screen.getByRole("radio", { name: /Legolas/ }));
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "5" } });
    await user.click(screen.getByRole("button", { name: /Move 5 to Legolas/ }));
    expect(onMove).toHaveBeenCalledWith(5, "m1");
  });

  it("hides quantity input when amount is 1", () => {
    render(<MoveItemModal item={{ ...item, amount: 1 }} members={members} onClose={() => {}} onMove={() => {}} />);
    expect(screen.queryByLabelText(/quantity/i)).toBeNull();
  });

  it("confirm button is disabled until a destination is selected", () => {
    render(<MoveItemModal item={item} members={members} onClose={() => {}} onMove={() => {}} />);
    expect(screen.getByRole("button", { name: /select destination/i })).toBeDisabled();
  });
});
