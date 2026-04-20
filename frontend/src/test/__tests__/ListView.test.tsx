import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListView } from "../../components/ListView";
import type { Item, Member } from "../../types";

const members: Member[] = [
  { id: "m1", userId: "u", groupId: "g", characterName: "Frodo", characterEmoji: "🌿", joinedAt: "" },
];
const items: Item[] = [
  { id: "i1", groupId: "g", memberId: null, name: "Rope",  description: "", amount: 2, value: "1",   createdAt: "", updatedAt: "" },
  { id: "i2", groupId: "g", memberId: "m1", name: "Sting", description: "", amount: 1, value: "500", createdAt: "", updatedAt: "" },
];

describe("ListView", () => {
  it("renders one row per item with location label", () => {
    render(<ListView items={items} members={members} onMove={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Rope")).toBeInTheDocument();
    expect(screen.getByText("Hoard")).toBeInTheDocument();
    expect(screen.getByText(/Frodo/)).toBeInTheDocument();
  });

  it("sorts ascending by name when name header clicked", async () => {
    const user = userEvent.setup();
    render(<ListView items={items} members={members} onMove={() => {}} onDelete={() => {}} />);
    await user.click(screen.getByRole("button", { name: /name/i }));
    const rows = screen.getAllByRole("row").slice(1).map((r) => r.textContent);
    expect(rows[0]).toContain("Rope");
    expect(rows[1]).toContain("Sting");
  });

  it("toggles to descending on a second click of the same column", async () => {
    const user = userEvent.setup();
    render(<ListView items={items} members={members} onMove={() => {}} onDelete={() => {}} />);
    await user.click(screen.getByRole("button", { name: /name/i }));
    await user.click(screen.getByRole("button", { name: /name/i }));
    const rows = screen.getAllByRole("row").slice(1).map((r) => r.textContent);
    expect(rows[0]).toContain("Sting");
    expect(rows[1]).toContain("Rope");
  });

  it("fires onMove / onDelete with the right item", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    const onDelete = vi.fn();
    render(<ListView items={items} members={members} onMove={onMove} onDelete={onDelete} />);
    await user.click(screen.getAllByRole("button", { name: /^move$/i })[0]);
    expect(onMove).toHaveBeenCalledWith(items[0]);
    await user.click(screen.getAllByRole("button", { name: /^delete$/i })[1]);
    expect(onDelete).toHaveBeenCalledWith(items[1]);
  });
});
