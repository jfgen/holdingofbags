import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoinsBar } from "../../components/CoinsBar";

const coins = { id: "c", groupId: "g", platinum: 1, electrum: 0, gold: 10, silver: 0, copper: 0 };

describe("CoinsBar", () => {
  it("shows every coin denomination", () => {
    render(<CoinsBar coins={coins} onChange={() => {}} />);
    expect(screen.getByLabelText(/platinum/i)).toHaveValue(1);
    expect(screen.getByLabelText(/gold/i)).toHaveValue(10);
    expect(screen.getByLabelText(/copper/i)).toHaveValue(0);
  });

  it("calls onChange with a partial patch when a value is edited and committed (blur)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CoinsBar coins={coins} onChange={onChange} />);
    const gold = screen.getByLabelText(/gold/i);
    await user.clear(gold);
    await user.type(gold, "25");
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith({ gold: 25 });
  });

  it("does not call onChange if value is unchanged after blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CoinsBar coins={coins} onChange={onChange} />);
    const gold = screen.getByLabelText(/gold/i);
    await user.click(gold);
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses type=number with min=0 on each input", () => {
    render(<CoinsBar coins={coins} onChange={() => {}} />);
    for (const label of [/platinum/i, /electrum/i, /gold/i, /silver/i, /copper/i]) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute("type", "number");
      expect(input).toHaveAttribute("min", "0");
    }
  });
});
