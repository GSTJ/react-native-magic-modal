const { withDangerousMod } = require("expo/config-plugins");
const { readFileSync, writeFileSync } = require("fs");

// Lowers SWIFT_STRICT_CONCURRENCY to `targeted` for the ExpoModulesCore pod
// so it builds on Xcode 16 (Swift 6 complete mode), pending the upstream
// fix at https://github.com/expo/expo/pull/44141. Scoped to that one pod.
const withExpoModulesCoreSwiftStrictConcurrency = (config) => {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfilePath = `${cfg.modRequest.platformProjectRoot}/Podfile`;
      const podfile = readFileSync(podfilePath, "utf8");

      const marker = "# @generated expo-modules-core-swift-strict-concurrency";
      if (podfile.includes(marker)) return cfg;

      const hook = `
${marker}
post_integrate do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'ExpoModulesCore'
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'targeted'
      end
    end
  end
end
`;

      writeFileSync(podfilePath, podfile + hook, "utf8");
      return cfg;
    },
  ]);
};

module.exports = withExpoModulesCoreSwiftStrictConcurrency;
