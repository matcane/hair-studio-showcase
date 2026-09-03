import DeviceCheck
import ExpoModulesCore

public class DeviceCheckModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDeviceCheck")

    Constant("isSupported") {
      DCDevice.current.isSupported
    }

    AsyncFunction("generateTokenAsync") { () -> String in
      guard DCDevice.current.isSupported else {
        throw DeviceCheckUnsupportedException()
      }

      do {
        let token = try await DCDevice.current.generateToken()
        return token.base64EncodedString()
      } catch {
        throw DeviceCheckTokenException(error.localizedDescription)
      }
    }
  }
}

internal final class DeviceCheckUnsupportedException: Exception {
  override var reason: String {
    "DeviceCheck is not supported on this device"
  }
}

internal final class DeviceCheckTokenException: GenericException<String> {
  override var reason: String {
    "Failed to generate a DeviceCheck token: \(param)"
  }
}
