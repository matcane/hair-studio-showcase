import { render, screen, userEvent } from "@testing-library/react-native";

import { Button } from "./Button";

const primary = "rgb(0, 255, 0)";
const textFlipped = "rgb(255, 0, 255)";

jest.mock("@/integrations/theme", () => ({
  useTheme: () => ({ colors: { primary, textFlipped } }),
}));

describe("Button", () => {
  it("renders", async () => {
    await render(<Button title="Btn" onPress={() => {}} />);

    expect(screen.getByRole("button")).toBeOnTheScreen();
  });

  it("renders secondary variant", async () => {
    await render(<Button variant="secondary" title="Btn" onPress={() => {}} />);

    expect(screen.getByRole("button")).toBeOnTheScreen();
    expect(screen.getByRole("button")).toHaveStyle({
      borderColor: primary,
      backgroundColor: "transparent",
      borderWidth: 2,
    });
    expect(screen.getByRole("button")).not.toHaveStyle({
      alignSelf: "stretch",
    });
  });

  it("calls onPress when tapped", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();

    await render(<Button title="Btn" onPress={onPress} />);

    await user.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
