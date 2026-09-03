import { render, screen, userEvent } from "@testing-library/react-native";

import { HairCard } from "./HairCard";

const primary = "rgb(0, 255, 0)";

jest.mock("@/integrations/theme", () => ({
  useTheme: () => ({ colors: { primary } }),
}));

const image = 1;

describe("HairCard", () => {
  it("renders", async () => {
    await render(<HairCard image={image} title="Wolf Cut" onPress={() => {}} />);

    expect(screen.getByText("Wolf Cut")).toBeOnTheScreen();
  });

  it("renders with borderColor when selected is true", async () => {
    await render(<HairCard image={image} selected title="Wolf Cut" onPress={() => {}} />);

    expect(screen.getByText("Wolf Cut")).toBeOnTheScreen();
    expect(screen.getByRole("button")).toHaveStyle({ borderColor: primary });
  });

  it("calls onPress when tapped", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();

    await render(<HairCard image={image} title="Wolf Cut" onPress={onPress} />);

    await user.press(screen.getByText("Wolf Cut"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
