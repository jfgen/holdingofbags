import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditItemModal } from "../../components/EditItemModal";
import { itemsApi } from "../../api/items";
import type { Item } from "../../types";

vi.mock("../../api/items", () => ({
  itemsApi: { update: vi.fn() },
}));

const item: Item = {
  id: "i1", groupId: "g1", memberId: null,
  name: "Healing Potion", description: "Restores HP",
  amount: 3, value: "5.00", createdAt: "", updatedAt: "",
};

describe("EditItemModal", () => {
  beforeEach(() => {
    vi.mocked(itemsApi.update).mockResolvedValue({ item });
  });

  it("renders with item values pre-populated", () => {
    render(<EditItemModal item={item} groupId="g1" onSaved={() => {}} onClose={() => {}} />);
    expect(screen.getByLabelText(/^name$/i)).toHaveValue("Healing Potion");
    expect(screen.getByLabelText(/amount/i)).toHaveValue(3);
  });

  it("calls itemsApi.update with correct args on submit", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<EditItemModal item={item} groupId="g1" onSaved={onSaved} onClose={() => {}} />);
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, "2");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(itemsApi.update).toHaveBeenCalledWith("g1", "i1", {
      name: "Healing Potion",
      description: "Restores HP",
      amount: 2,
      value: "5.00",
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it("shows error when API call fails", async () => {
    const user = userEvent.setup();
    vi.mocked(itemsApi.update).mockRejectedValue(new Error("network error"));
    render(<EditItemModal item={item} groupId="g1" onSaved={() => {}} onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(await screen.findByText(/failed/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<EditItemModal item={item} groupId="g1" onSaved={() => {}} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
