import { render, screen } from "@testing-library/react-native";

import { CameraDetectionStatus } from "./CameraDetectionStatus";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("CameraDetectionStatus", () => {
  it("renders", async () => {
    await render(<CameraDetectionStatus status="Face detected" />);

    expect(screen.getByText("camera.detectionStatus.Face detected")).toBeOnTheScreen();
  });
});
