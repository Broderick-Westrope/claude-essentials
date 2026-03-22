// Notification plugin for OpenCode
// Cross-platform notifications when OpenCode is waiting for input
// macOS: Uses terminal-notifier if available (click-to-focus), falls back to osascript
// Linux: Uses notify-send

import type { Plugin } from "@opencode-ai/plugin";

export const NotifyPlugin: Plugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return;

      const project = process.cwd().split("/").pop() || "project";
      const message = `Waiting for input in ${project}`;
      const title = "OpenCode";

      if (process.platform === "darwin") {
        // Try terminal-notifier first (supports click-to-focus)
        try {
          // Detect terminal app for click-to-activate
          const termProgram = process.env.TERM_PROGRAM || "";
          const appIdMap: Record<string, string> = {
            "iTerm.app": "com.googlecode.iterm2",
            Apple_Terminal: "com.apple.Terminal",
            WarpTerminal: "dev.warp.Warp-Stable",
            vscode: "com.microsoft.VSCode",
            Alacritty: "org.alacritty",
            kitty: "net.kovidgoyal.kitty",
          };
          const appId = appIdMap[termProgram] || "com.apple.Terminal";

          // Get git branch if available
          let subtitle = "Click to focus";
          try {
            const branch =
              await $`git branch --show-current 2>/dev/null`.text();
            if (branch.trim()) subtitle = branch.trim();
          } catch {
            // Not in a git repo, use default subtitle
          }

          await $`terminal-notifier -title ${title} -subtitle ${subtitle} -message ${message} -sound Glass -group opencode-${project} -activate ${appId} -ignoreDnD`;
        } catch {
          // Fall back to osascript
          await $`osascript -e ${'display notification "' + message + '" with title "' + title + '" sound name "Glass"'}`.catch(
            () => {},
          );
        }
      } else {
        // Linux
        await $`notify-send -u normal -a ${title} ${title} ${message}`.catch(
          () => {},
        );
      }
    },
  };
};
